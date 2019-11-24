import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth
} from "./requests";
import {
  ProtoOAApplicationAuthReq,
  ProtoOAGetAccountListByAccessTokenReq,
  ProtoOAAccountAuthReq
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

  public applicationAuth(
    payload: Omit<
      ProtoOAApplicationAuthReq,
      "payloadType" | "clientId" | "clientSecret"
    >,
    timeout?: number,
    msgId?: string
  ) {
    const { clientId, clientSecret } = this.authOptions;
    return applicationAuth(
      this,
      { ...payload, clientId, clientSecret },
      timeout,
      msgId
    );
  }

  public getAccountsByAccessToken(
    payload: Omit<
      ProtoOAGetAccountListByAccessTokenReq,
      "payloadType" | "accessToken"
    >,
    timeout?: number,
    msgId?: string
  ) {
    const { accessToken } = this.authOptions;
    return getAccountsByAccessToken(
      this,
      { ...payload, accessToken },
      timeout,
      msgId
    );
  }

  public accountAuth(
    payload: Omit<ProtoOAAccountAuthReq, "payloadType" | "accessToken">,
    timeout?: number,
    msgId?: string
  ) {
    const { accessToken } = this.authOptions;
    return accountAuth(this, { ...payload, accessToken }, timeout, msgId);
  }
}
export default TestSubject;
