import * as actions from "./actions";
import { combineReducers } from "redux";

function connected(state: boolean = false, action: actions.Actions) {
  switch (action.type) {
    case actions.SPOTWARE__CONNECT:
      return true;
    case actions.SPOTWARE__DISCONNECT:
      return false;
    default:
      return state;
  }
}

function host(state: string = "live.ctraderapi.com", action: actions.Actions) {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE_HOST:
      return action.host;
    default:
      return state;
  }
}

function port(state: number = 5035, action: actions.Actions) {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE_PORT:
      return action.port;
    default:
      return state;
  }
}

export const spotwareClient = combineReducers({ connected, host, port });
