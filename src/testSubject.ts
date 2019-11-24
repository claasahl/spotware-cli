import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth,
  trader
} from "./requests";
import { concat, of, EMPTY, Observable } from "rxjs";
import { flatMap, map, shareReplay } from "rxjs/operators";
import {
  ProtoOATrader,
  ProtoOACtidTraderAccount
} from "@claasahl/spotware-adapter";

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
}
export default TestSubject;
