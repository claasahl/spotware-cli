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
import { concat, EMPTY, Observable, timer, combineLatest, Subject } from "rxjs";
import {
  flatMap,
  map,
  filter,
  first,
  mapTo,
  tap,
  pairwise,
  publishReplay,
  refCount
} from "rxjs/operators";
import {
  ProtoOATrader,
  ProtoOASymbol,
  ProtoMessage2131,
  ProtoOAPayloadType,
  ProtoOAGetAccountListByAccessTokenRes,
  ProtoOATraderRes,
  ProtoOASymbolsListRes,
  ProtoOASymbolByIdRes,
  ProtoOATraderReq,
  ProtoOASymbolByIdReq,
  ProtoOASymbolsListReq,
  ProtoOAGetAccountListByAccessTokenReq
} from "@claasahl/spotware-adapter";
import mem from "mem";

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

const cacheKey = (arguments_: any) => JSON.stringify(arguments_);
export class TestSubject extends SpotwareSubject {
  private authOptions: AuthenticationOptions;

  constructor(
    authOptions: AuthenticationOptions,
    connOptions: ConnectionOptions
  ) {
    super(connOptions.port, connOptions.host, connOptions.options);
    this.authOptions = { ...authOptions };
  }

  private getAccountsByAccessToken = mem(
    (
      payload: Omit<ProtoOAGetAccountListByAccessTokenReq, "accessToken">
    ): Observable<ProtoOAGetAccountListByAccessTokenRes> => {
      return getAccountsByAccessToken(this, {
        ...payload,
        accessToken: this.authOptions.accessToken
      }).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private trader = mem(
    (payload: ProtoOATraderReq): Observable<ProtoOATraderRes> => {
      return trader(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolsList = mem(
    (payload: ProtoOASymbolsListReq): Observable<ProtoOASymbolsListRes> => {
      return symbolsList(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolById = mem(
    (payload: ProtoOASymbolByIdReq): Observable<ProtoOASymbolByIdRes> => {
      return symbolById(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );

  public authenticate(): Observable<void> {
    const { clientId, clientSecret, accessToken } = this.authOptions;
    const authApplication = applicationAuth(this, { clientId, clientSecret });
    const authAccounts = this.getAccountsByAccessToken({}).pipe(
      flatMap(res => res.ctidTraderAccount),
      flatMap(({ ctidTraderAccountId }) =>
        accountAuth(this, { accessToken, ctidTraderAccountId })
      )
    );
    return concat(authApplication, authAccounts).pipe(flatMap(() => EMPTY));
  }

  public accounts(): Observable<ProtoOATrader> {
    return this.getAccountsByAccessToken({}).pipe(
      flatMap(res => res.ctidTraderAccount),
      flatMap(({ ctidTraderAccountId }) =>
        this.trader({ ctidTraderAccountId })
      ),
      map(pm => pm.trader)
    );
  }

  public symbol(
    ...symbols: string[]
  ): Observable<ProtoOASymbol & { ctidTraderAccountId: number }> {
    // TODO: this should be grouped
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        const lookupSymbolId = this.symbolsList({ ctidTraderAccountId }).pipe(
          map(res =>
            res.symbol.filter(symbol =>
              symbols.includes(symbol.symbolName || "")
            )
          ),
          map(symbols => symbols.map(symbol => symbol.symbolId))
        );

        const lookupSymbol = lookupSymbolId.pipe(
          flatMap(symbolId =>
            this.symbolById({ ctidTraderAccountId, symbolId })
          ),
          flatMap(res => res.symbol),
          map(a => ({ ...a, ctidTraderAccountId })),
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
        this.symbolsList({ ctidTraderAccountId })
          .pipe(
            flatMap(res => res.symbol),
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
