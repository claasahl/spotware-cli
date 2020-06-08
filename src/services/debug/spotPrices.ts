import {PassThrough} from "stream";

import * as B from "../base";

export class SpotPricesStream extends PassThrough implements B.SpotPricesStream {
  readonly props: B.SpotPricesProps;

  constructor(props: B.SpotPricesProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
  }

  push(chunk: B.SpotPricesEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  trendbars(_props: B.SpotPricesSimpleTrendbarsProps): B.TrendbarsStream {
    throw new Error("Method not implemented.");
  }
}