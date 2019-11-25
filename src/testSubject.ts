import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth,
  trader,
  symbolsList,
  symbolById,
  subscribeSpots
} from "./requests";
import {
  concat,
  of,
  EMPTY,
  Observable,
  timer,
  combineLatest,
  Subject
} from "rxjs";
import {
  flatMap,
  map,
  shareReplay,
  filter,
  first,
  mapTo,
  tap,
  pairwise
} from "rxjs/operators";
import {
  ProtoOATrader,
  ProtoOACtidTraderAccount,
  ProtoOASymbol,
  ProtoOALightSymbol,
  ProtoMessage2131,
  ProtoOAPayloadType
} from "@claasahl/spotware-adapter";
import { pm51 } from "./utils";

interface AuthenticationOptions {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
interface ConnectionOptions {
  port: number;
  host: string;
  options?: TlsOptions;
}

interface Spot {
  ask: number;
  bid: number;
  symbolId: number;
  ctidTraderAccountId: number;
  date: Date;
}

export class TestSubject extends SpotwareSubject {
  private authOptions: AuthenticationOptions;

  constructor(
    authOptions: AuthenticationOptions,
    connOptions: ConnectionOptions
  ) {
    const { port, host, options } = connOptions;
    super(port, host, options);
    this.authOptions = { ...authOptions };
  }

  private accountsBase(): Observable<ProtoOACtidTraderAccount> {
    const { accessToken } = this.authOptions;
    return getAccountsByAccessToken(this, { accessToken }).pipe(
      flatMap(pm => pm.payload.ctidTraderAccount),
      shareReplay()
    );
  }

  private symbolsBase(
    ctidTraderAccountId: number
  ): Observable<ProtoOALightSymbol> {
    return symbolsList(this, { ctidTraderAccountId }).pipe(
      flatMap(pm => pm.payload.symbol),
      shareReplay()
    );
  }

  private symbolBase(
    ctidTraderAccountId: number,
    symbolId: number
  ): Observable<ProtoOASymbol> {
    return symbolById(this, { ctidTraderAccountId, symbolId: [symbolId] }).pipe(
      flatMap(pm => pm.payload.symbol),
      shareReplay()
    );
  }

  public authenticate(): Observable<void> {
    const { clientId, clientSecret, accessToken } = this.authOptions;
    const authApplication = applicationAuth(this, { clientId, clientSecret });
    const authAccounts = of(1).pipe(
      flatMap(() => this.accountsBase()),
      flatMap(({ ctidTraderAccountId }) =>
        accountAuth(this, { accessToken, ctidTraderAccountId })
      )
    );
    return concat(authApplication, authAccounts).pipe(flatMap(() => EMPTY));
  }

  public accounts(): Observable<ProtoOATrader> {
    return this.accountsBase().pipe(
      flatMap(({ ctidTraderAccountId }) =>
        trader(this, { ctidTraderAccountId })
      ),
      map(pm => pm.payload.trader)
    );
  }

  public symbol(symbol: string): Observable<ProtoOASymbol> {
    // TODO: this should be grouped
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        const lookupSymbolId = this.symbolsBase(ctidTraderAccountId).pipe(
          filter(({ symbolName }) => symbolName === symbol),
          map(symbol => symbol.symbolId),
          first()
        );

        const lookupSymbol = lookupSymbolId.pipe(
          flatMap(symbolId => this.symbolBase(ctidTraderAccountId, symbolId)),
          first()
        );
        return lookupSymbol;
      })
    );
  }

  public spots(symbol: string): Observable<Spot> {
    // TODO: this should be grouped
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        const symbolId = new Subject<number>();
        this.symbolsBase(ctidTraderAccountId)
          .pipe(
            filter(({ symbolName }) => symbolName === symbol),
            map(symbol => symbol.symbolId),
            first()
          )
          .subscribe(symbolId);

        const subscribeToSymbol = symbolId.pipe(
          flatMap(symbolId =>
            subscribeSpots(this, { ctidTraderAccountId, symbolId: [symbolId] })
          )
        );

        const spotEvents = this.pipe(
          filter(
            (pm): pm is ProtoMessage2131 =>
              pm.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT
          ),
          map(pm => pm.payload)
        );
        const spotEventForSymbol = combineLatest(spotEvents, symbolId).pipe(
          filter(([event, symbolId]) => event.symbolId === symbolId),
          filter(
            ([event, _symbolId]) =>
              event.ctidTraderAccountId === ctidTraderAccountId
          ),
          map(([event, _symbolId]) => event)
        );

        const spotsForSymbol = spotEventForSymbol.pipe(
          filter(event => !!(event.ask || event.bid)),
          map(({ ask, bid, ctidTraderAccountId, symbolId }) => ({
            ask,
            bid,
            symbolId,
            ctidTraderAccountId,
            date: new Date()
          })),
          pairwise(),
          map(([left, right]) => {
            const spot = { ...right };
            if (!spot.ask) {
              spot.ask = left.ask;
            }
            if (!spot.bid) {
              spot.bid = left.bid;
            }
            return spot;
          }),
          filter((spot): spot is Spot => !!(spot.ask && spot.bid))
        );

        return subscribeToSymbol.pipe(flatMap(() => spotsForSymbol));
      })
    );
  }

  public heartbeats(): Observable<void> {
    return timer(10000, 10000).pipe(
      mapTo(pm51({})),
      tap(this),
      mapTo(undefined)
    );
  }
}
export default TestSubject;
