import {Order as Base} from "../order"

export class Order extends Base {
    close() {
        return this;
    }
    cancel() {
        return this;
    }
    end() {
        return this;
    }
    amend() {
        return this;
    }
}