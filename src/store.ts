import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";

import { spotwareClient } from "./reducers";
import { Actions } from "./actions";

export interface State {
  connected: boolean;
  host: string;
  port: number;
}

const loggerMiddleware = createLogger({ colors: false });

const store = createStore<State, Actions, {}, {}>(
  spotwareClient,
  applyMiddleware(thunkMiddleware, loggerMiddleware)
);
export default store;
