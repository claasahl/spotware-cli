import {PassThrough} from "stream";
import debug from "debug";

import * as B from "../base";

const events: B.AccountEvent["type"][] = ["BALANCE_CHANGED" , "TRANSACTION" , "EQUITY_CHANGED" , "CREATED" , "ACCEPTED" , "REJECTED" , "EXPIRED" , "CANCELED" , "FILLED" , "PROFITLOSS" , "CLOSED" , "ENDED"]

export class AccountStream extends PassThrough implements B.AccountStream {
  readonly props: B.AccountProps;
  private readonly log: debug.Debugger;

  constructor(props: B.AccountProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    this.log = debug("account");
  }

  push(chunk: B.AccountEvent | null, encoding?: BufferEncoding): boolean {
    if(chunk && events.includes(chunk.type)) {
      this.log("%j", chunk);
    }
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