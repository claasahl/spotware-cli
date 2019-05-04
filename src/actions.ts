import { Action } from "redux";

export const SPOTWARE__CONFIGURE_HOST = "SPOTWARE__CONFIGURE_HOST";
export interface SpotwareConfigureHostAction
  extends Action<typeof SPOTWARE__CONFIGURE_HOST> {
  host: string;
}
export function configureHost(host: string): SpotwareConfigureHostAction {
  return { type: SPOTWARE__CONFIGURE_HOST, host };
}

export const SPOTWARE__CONFIGURE_PORT = "SPOTWARE__CONFIGURE_PORT";
export interface SpotwareConfigurePortAction
  extends Action<typeof SPOTWARE__CONFIGURE_PORT> {
  port: number;
}
export function configurePort(port: number): SpotwareConfigurePortAction {
  return { type: SPOTWARE__CONFIGURE_PORT, port };
}

export const SPOTWARE__CONNECT = "SPOTWARE__CONNECT";
export interface SpotwareConnectAction
  extends Action<typeof SPOTWARE__CONNECT> {}
export function connect(): SpotwareConnectAction {
  return { type: SPOTWARE__CONNECT };
}

export const SPOTWARE__DISCONNECT = "SPOTWARE__DISCONNECT";
export interface SpotwareDisconnectAction
  extends Action<typeof SPOTWARE__DISCONNECT> {}
export function disconnect(): SpotwareDisconnectAction {
  return { type: SPOTWARE__DISCONNECT };
}

export type SpotwareAction =
  | SpotwareConfigureHostAction
  | SpotwareConfigurePortAction
  | SpotwareConnectAction
  | SpotwareDisconnectAction;

export type Actions = SpotwareAction;
