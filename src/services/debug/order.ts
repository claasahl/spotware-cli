import {PassThrough} from "stream";

import * as B from "../base";

export class OrderStream<Props extends B.OrderProps> extends PassThrough implements B.OrderStream<Props> {
  readonly props: Props;

  constructor(props: Props) {
    super({objectMode: true});
    this.props = Object.freeze(props);
  }

  push(chunk: B.OrderEvent | null, encoding?: BufferEncoding): boolean {
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