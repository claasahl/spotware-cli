import {PassThrough} from "stream";
import debug from "debug";

import * as B from "../base";

const events: B.OrderEvent["type"][] = ["CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export class OrderStream<Props extends B.OrderProps> extends PassThrough implements B.OrderStream<Props> {
  readonly props: Props;
  private readonly log: debug.Debugger;

  constructor(props: Props) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    this.log = debug("order")
      .extend(props.symbol.toString())
      .extend(props.id);
  }

  push(chunk: B.OrderEvent | null, encoding?: BufferEncoding): boolean {
    if(chunk && events.includes(chunk.type)) {
      this.log("%j", chunk);
    }
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