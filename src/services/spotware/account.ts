import {AccountStream as Base} from "../account"
import { OrderStream } from "../order";
import { Symbol } from "../types";
import { TrendbarsStream } from "../trendbars";
import { SpotPricesStream } from "../spotPrices";

export class Account extends Base {
    order(_symbol: Symbol): OrderStream {
        throw new Error("not implemented")
    }
    spotPrices(_symbol: Symbol): SpotPricesStream {
        throw new Error("not implemented")
    }
    trendbars(_symbol: Symbol): TrendbarsStream {
        throw new Error("not implemented")
    }
}
