import {PassThrough} from "stream";

import * as T from "../types";
import * as L from "../logging";

export class OrderStream<Props extends T.OrderProps> extends PassThrough implements T.OrderStream<Props> {
  readonly props: Props;

  constructor(props: Props) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    L.logOrderEvents(this);
  }

  push(chunk: T.OrderEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  closeOrder(): void {
    throw new Error("Method not implemented.");
  }

  cancelOrder(): void {
    throw new Error("Method not implemented.");
  }

  endOrder(): void {
    throw new Error("Method not implemented.");
  }
}