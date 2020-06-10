import {PassThrough} from "stream";

import * as T from "../types";
import * as L from "../logging";

export class SpotPricesStream extends PassThrough implements T.SpotPricesStream {
  readonly props: T.SpotPricesProps;

  constructor(props: T.SpotPricesProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    L.logSpotPriceEvents(this);
  }

  push(chunk: T.SpotPricesEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  trendbars(_props: T.SpotPricesSimpleTrendbarsProps): T.TrendbarsStream {
    throw new Error("Method not implemented.");
  }
}