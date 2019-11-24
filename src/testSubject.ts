import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth,
  trader,
  symbolsList,
  symbolById
} from "./requests";
import { concat, of, EMPTY, Observable, timer } from "rxjs";
import {
  flatMap,
  map,
  shareReplay,
  filter,
  first,
  mapTo,
  tap
} from "rxjs/operators";
import {
  ProtoOATrader,
  ProtoOACtidTraderAccount,
  ProtoOASymbol,
  ProtoOALightSymbol
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

  public symbol(
    ctidTraderAccountId: number,
    symbol: string
  ): Observable<ProtoOASymbol> {
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
