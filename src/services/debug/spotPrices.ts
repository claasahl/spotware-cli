import {PassThrough} from "stream";
import debug from "debug";

import * as B from "../base";

const events: B.SpotPricesEvent["type"][] = ["ASK_PRICE_CHANGED" , "BID_PRICE_CHANGED" , "PRICE_CHANGED"]

export class SpotPricesStream extends PassThrough implements B.SpotPricesStream {
  readonly props: B.SpotPricesProps;
  private readonly log: debug.Debugger;

  constructor(props: B.SpotPricesProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    this.log = debug("spotPrices")
      .extend(props.symbol.toString());
  }

  push(chunk: B.SpotPricesEvent | null, encoding?: BufferEncoding): boolean {
    if(chunk && events.includes(chunk.type)) {
      this.log("%j", event);
    }
    return super.push(chunk, encoding);
  }

  trendbars(_props: B.SpotPricesSimpleTrendbarsProps): B.TrendbarsStream {
    throw new Error("Method not implemented.");
  }
}