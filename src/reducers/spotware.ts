import { combineReducers } from "redux";

import * as actions from "../actions";

function connected(state: boolean = false, action: actions.Actions): boolean {
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
  action: actions.Actions
): string {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE:
      return action.host;
    default:
      return state;
  }
}

function port(state: number = 5035, action: actions.Actions): number {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE:
      return action.port;
    default:
      return state;
  }
}

const reducers = combineReducers({ connected, host, port });
export default reducers;
