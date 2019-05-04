import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";

import { spotwareClient } from "./reducers";

const loggerMiddleware = createLogger({ colors: false });

const store = createStore(
  spotwareClient,
  applyMiddleware(thunkMiddleware, loggerMiddleware)
);
export default store;
