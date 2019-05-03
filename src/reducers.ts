import * as actions from "./actions";
import { combineReducers } from "redux";
interface State {
  connected: boolean;
  host: string;
  port: number;
}

function connected(state: boolean = false, action: actions.SpotwareAction) {
  switch (action.type) {
    case actions.SPOTWARE__CONNECT:
      return true;
    case actions.SPOTWARE__DISCONNECT:
      return false;
    default:
      return state;
  }
}

function host(
  state: string = "live.ctraderapi.com",
  action: actions.SpotwareAction
) {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE:
      return action.host;
    default:
      return state;
  }
}

function port(state: number = 5035, action: actions.SpotwareAction) {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE:
      return action.port;
    default:
      return state;
  }
}

export const spotwareClient = combineReducers({ connected, host, port });
