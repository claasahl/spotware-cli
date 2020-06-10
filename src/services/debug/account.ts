import {PassThrough} from "stream";

import * as T from "../types";
import * as L from "../logging";

export class AccountStream extends PassThrough implements T.AccountStream {
  readonly props: T.AccountProps;

  constructor(props: T.AccountProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    L.logAccountEvents(this);
  }

  push(chunk: T.AccountEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  marketOrder(_props: T.AccountSimpleMarketOrderProps): T.OrderStream<T.MarketOrderProps> {
    throw new Error("Method not implemented.");
  }

  stopOrder(_props: T.AccountSimpleStopOrderProps): T.OrderStream<T.StopOrderProps> {
    throw new Error("Method not implemented.");
  }

  spotPrices(_props: T.AccountSimpleSpotPricesProps): T.SpotPricesStream {
    throw new Error("Method not implemented.");
  }

  trendbars(_props: T.AccountSimpleTrendbarsProps): T.TrendbarsStream {
    throw new Error("Method not implemented.");
  }
}