import {AccountStream as Base} from "../account"
import { OrderStream } from "../order";
import { Symbol } from "../types";

export class Account extends Base {
    order(_symbol: Symbol): OrderStream {
        throw new Error("not implemented")
    }
}
