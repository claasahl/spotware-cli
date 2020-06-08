import {PassThrough} from "stream";

import * as B from "../base";

export class AccountStream extends PassThrough implements B.AccountStream {
  readonly props: B.AccountProps;

  constructor(props: B.AccountProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
  }

  push(chunk: B.AccountEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  marketOrder(_props: B.AccountSimpleMarketOrderProps): B.OrderStream<B.MarketOrderProps> {
    throw new Error("Method not implemented.");
  }

  stopOrder(_props: B.AccountSimpleStopOrderProps): B.OrderStream<B.StopOrderProps> {
    throw new Error("Method not implemented.");
  }

  spotPrices(_props: B.AccountSimpleSpotPricesProps): B.SpotPricesStream {
    throw new Error("Method not implemented.");
  }

  trendbars(_props: B.AccountSimpleTrendbarsProps): B.TrendbarsStream {
    throw new Error("Method not implemented.");
  }
}