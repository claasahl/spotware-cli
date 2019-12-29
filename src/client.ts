import SpotwareSubject from "./testSubject";
import debug from "debug";

import config from "./config";
import { concat, merge } from "rxjs";
import { ProtoOATradeSide } from "@claasahl/spotware-adapter";
import { tap } from "rxjs/operators";

function main() {
  const log = debug("client");
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
      // subject.spots("BTC/EUR"),
      subject.heartbeats(),
      subject
        .tickData(
          "BTC/EUR",
          new Date("2019-12-28T00:00:00.000Z"),
          new Date("2019-12-29T00:00:00.000Z")
        )
        .pipe(tap(a => log(`-- ` + JSON.stringify(a, null, 2))))
      // subject.openOrdersAndPositions("labeled"),
      // subject.stopOrder("BTC/EUR", {
      //   volume: 0.01,
      //   tradeSide: ProtoOATradeSide.BUY,
      //   stopPrice: 6300.12,
      //   takeProfit: 6400,
      //   stopLoss: 6200,
      //   expirationTimestamp: new Date().getTime() + 60000
      // })
      // subject.closePositionn("BTC/EUR", {positionId: 18946027, volume: 0.01}),
      // subject.cancelOrderr({orderId:33537392})
      // subject.amendOrderr("BTC/EUR", {orderId: 33532474,
      //       volume: 0.01,
      //   limitPrice: 6300.12,
      //   takeProfit: 6400.0,
      //   stopLoss: 6300,
      //   expirationTimestamp: new Date().getTime() + 60000
      // })
      // subject.amendPositionSltpp({
      //   positionId: 18943604,
      //   stopLoss: 6312,
      //   takeProfit: 6400.0,
      //   trailingStopLoss: true
      // })
    )
  ).subscribe(undefined, console.log, main);
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
