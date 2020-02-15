import {Account as Base} from "../account"
import { OrderStream } from "../order";
import { Symbol } from "../types";
import { Order } from "./order";

let latestOrderId = 0;
export class Account extends Base {
    order(symbol: Symbol): OrderStream {
        return new Order(`${++latestOrderId}`, symbol);
    }
}