import { Action } from "redux";

/*
 * action types
 */

export const SPOTWARE__CONFIGURE = "SPOTWARE__CONFIGURE";
export const SPOTWARE__CONNECT = "SPOTWARE__CONNECT";
export const SPOTWARE__DISCONNECT = "SPOTWARE__DISCONNECT";

export type SPOTWARE_ACTION_TYPES =
  | "SPOTWARE__CONFIGURE"
  | "SPOTWARE__CONNECT"
  | "SPOTWARE__DISCONNECT";

export interface SpotwareConfigureAction extends Action<"SPOTWARE__CONFIGURE"> {
  host: string;
  port: number;
}
export interface SpotwareConnectAction extends Action<"SPOTWARE__CONNECT"> {}
export interface SpotwareDisconnectAction
  extends Action<"SPOTWARE__DISCONNECT"> {}

export type SpotwareAction =
  | SpotwareConfigureAction
  | SpotwareConnectAction
  | SpotwareDisconnectAction;

/*
 * action creators
 */

export function configure(host: string, port: number): SpotwareConfigureAction {
  return { type: SPOTWARE__CONFIGURE, host, port };
}

export function connect(): SpotwareConnectAction {
  return { type: SPOTWARE__CONNECT };
}

export function disconnect(): SpotwareDisconnectAction {
  return { type: SPOTWARE__DISCONNECT };
}
