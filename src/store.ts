import { createStore } from "redux";

import { spotwareClient } from "./reducers";

const store = createStore(spotwareClient);
export default store;
