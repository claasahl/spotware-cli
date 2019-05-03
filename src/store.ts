import { createStore } from "redux";
import * as actions from "./actions";

interface State {
  connected: boolean;
  host: string;
  port: number;
}

const INITIAL_STATE: State = {
  connected: false,
  host: "live.ctraderapi.com",
  port: 5035
};

function counter(state: State = INITIAL_STATE, action: actions.SpotwareAction) {
  switch (action.type) {
    case actions.SPOTWARE__CONFIGURE:
      return { ...state, host: action.host, port: action.port };
    case actions.SPOTWARE__CONNECT:
      return { ...state, connected: true };
    case actions.SPOTWARE__DISCONNECT:
      return { ...state, connected: false };
    default:
      return state;
  }
}

const store = createStore(counter);
export default store;

store.subscribe(() => {});
const state = store.getState();
