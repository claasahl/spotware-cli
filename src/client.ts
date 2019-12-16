import SpotwareSubject from "./testSubject";

import config from "./config";
import { concat, merge } from "rxjs";
import { ProtoOATradeSide } from "@claasahl/spotware-adapter";

function main() {
  const { port, host, clientId, clientSecret, accessToken } = config;
  const subject = new SpotwareSubject(
    { clientId, clientSecret, accessToken },
    { port, host }
  );
  subject.subscribe(undefined, undefined, main);

  ProtoOATradeSide.BUY;

  concat(
    subject.authenticate(),
    subject.symbol("BTC/USD"),
    subject.symbol("BTC/EUR"),
    merge(
      subject.spots("BTC/EUR"),
      subject.heartbeats(),
      subject.openOrdersAndPositions("labeled"),
      subject.limitOrder("BTC/EUR", {
        volume: 0.01,
        tradeSide: ProtoOATradeSide.BUY,
        limitPrice: 6375.12,
        takeProfit: 6400.0,
        stopLoss: 6300,
        expirationTimestamp: new Date().getTime() + 60000,
        label: "labeled"
      })
      // subject.closePositionn("BTC/EUR", {positionId: 18946027, volume: 0.01}),
      // subject.cancelOrderr({orderId:33537392})
      // subject.amendOrderr("BTC/EUR", {orderId: 33532474,
      //       volume: 0.01,
      //   limitPrice: 6300.12,
      //   takeProfit: 6400.0,
      //   stopLoss: 6300,
      //   expirationTimestamp: new Date().getTime() + 600000
      // })
      // subject.amendPositionSltpp({
      //   positionId: 18943604,
      //   stopLoss: 6312,
      //   takeProfit: 6400.0,
      //   trailingStopLoss: true
      // })
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
}
main();
