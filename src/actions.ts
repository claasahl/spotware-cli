import { Action } from "redux";

export const SPOTWARE__CONFIGURE = "SPOTWARE__CONFIGURE";
export interface SpotwareConfigureAction extends Action<"SPOTWARE__CONFIGURE"> {
  host: string;
  port: number;
}
export function configure(host: string, port: number): SpotwareConfigureAction {
  return { type: SPOTWARE__CONFIGURE, host, port };
}

export const SPOTWARE__CONNECT = "SPOTWARE__CONNECT";
export interface SpotwareConnectAction extends Action<"SPOTWARE__CONNECT"> {}
export function connect(): SpotwareConnectAction {
  return { type: SPOTWARE__CONNECT };
}

export const SPOTWARE__DISCONNECT = "SPOTWARE__DISCONNECT";
export interface SpotwareDisconnectAction
  extends Action<"SPOTWARE__DISCONNECT"> {}
export function disconnect(): SpotwareDisconnectAction {
  return { type: SPOTWARE__DISCONNECT };
}

export type SpotwareAction =
  | SpotwareConfigureAction
  | SpotwareConnectAction
  | SpotwareDisconnectAction;

export type Actions = SpotwareAction;
