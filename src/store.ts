import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";

import { spotwareClient } from "./reducers";

const loggerMiddleware = createLogger({ colors: false });

const store = createStore(spotwareClient, applyMiddleware(loggerMiddleware));
export default store;
