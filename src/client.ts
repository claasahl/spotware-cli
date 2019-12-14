import SpotwareSubject from "./testSubject";

import config from "./config";
import { concat, merge } from "rxjs";
import { ProtoOATradeSide } from "@claasahl/spotware-adapter";

const { port, host, clientId, clientSecret, accessToken } = config;
const subject = new SpotwareSubject(
  { clientId, clientSecret, accessToken },
  { port, host }
);

ProtoOATradeSide.BUY;

concat(
  subject.authenticate(),
  subject.symbol("BTC/USD"),
  subject.symbol("BTC/EUR"),
  merge(
    subject.spots("BTC/EUR"),
    subject.heartbeats(),
    subject.ordersAndPositions(),
    subject.limitOrder(
      "BTC/EUR",
      0.01,
      ProtoOATradeSide.BUY,
      6375.12,
      6400.0,
      6300,
      new Date().getTime() + 30000
    )
    // subject.closePositionn(18943584, "BTC/EUR", 0.01)
    // subject.cancelOrderr(33532443)
  )
).subscribe();
// {
//   ctidTraderAccountId: number;
//   symbolId: number;
//   orderType: ProtoOAOrderType;
//   tradeSide: ProtoOATradeSide;
//   volume: number;
//   limitPrice?: number;
//   stopPrice?: number;
//   timeInForce?: ProtoOATimeInForce;
//   expirationTimestamp?: number;
//   stopLoss?: number;
//   takeProfit?: number;
//   comment?: string;
//   baseSlippagePrice?: number;
//   slippageInPoints?: number;
//   label?: string;
//   positionId?: number;
//   clientOrderId?: string;
//   relativeStopLoss?: number;
//   relativeTakeProfit?: number;
//   guaranteedStopLoss?: boolean;
//   trailingStopLoss?: boolean;
//   stopTriggerMethod?: ProtoOAOrderTriggerMethod;
// }
