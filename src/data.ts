import ms from "ms";

const data = {
  history: [
    {
      dealId: 37623205,
      orderId: 33006996,
      positionId: 18674051,

      position: {
        dealId: 37623101,
        orderId: 33006875,
        positionId: 18674051,
        volume: 10,
        filledVolume: 10,
        symbolId: 22396,
        createTimestamp: 1573587419422,
        executionTimestamp: 1573587419723,
        tradeSide: 1,
        dealStatus: 2,
        utcLastUpdateTimestamp: 1573587419422,
        executionPrice: 7968.29,
        marginRate: 7968.29,
        commission: 0,
        baseToUsdConversionRate: 8779.75
      },

      volume: 10,
      filledVolume: 10,
      symbolId: 22396,
      createTimestamp: 1573588090075,
      executionTimestamp: 1573588090374,
      tradeSide: 2,
      dealStatus: 2,
      utcLastUpdateTimestamp: 1573588090075,
      executionPrice: 7960.04,
      marginRate: 7960.04,
      commission: 0,
      baseToUsdConversionRate: 8766.03,
      closePositionDetail: {
        entryPrice: 7968.29,
        grossProfit: -82,
        swap: 0,
        commission: 0,
        balance: 99918,
        quoteToDepositConversionRate: 1,
        closedVolume: 10,
        balanceVersion: 1
      }
    }
  ],
  orders: [],
  positions: [
    {
      dealId: 37623862,
      orderId: 33007767,
      positionId: 18674500,
      volume: 10,
      filledVolume: 10,
      symbolId: 22396,
      createTimestamp: 1573591695100,
      executionTimestamp: 1573591695335,
      tradeSide: 1,
      dealStatus: 2,
      utcLastUpdateTimestamp: 1573591695100,
      executionPrice: 8000.39,
      marginRate: 8000.39,
      commission: 0,
      baseToUsdConversionRate: 8798.19
    }
  ]
};

//
// HISTORY
//
const historyItem = data.history[0];
console.log("history item (DID37623205) -> position details");
console.log(
  `OID${historyItem.position.orderId}`,
  new Date("2019-11-12T19:36:14.507Z")
);
console.log(
  `DID${historyItem.position.dealId}`,
  new Date(historyItem.position.executionTimestamp),
  ms(
    historyItem.position.executionTimestamp -
      new Date("2019-11-12T19:36:14.507Z").getTime()
  )
);
console.log(
  `PID${historyItem.position.positionId}`,
  new Date(historyItem.position.executionTimestamp),
  ms(0)
);
console.log(
  `###________`,
  new Date("2019-11-12T19:36:59.733Z"),
  ms(
    new Date("2019-11-12T19:36:59.733Z").getTime() -
      historyItem.position.executionTimestamp
  )
);
console.log(
  `OID${historyItem.orderId}`,
  new Date(historyItem.createTimestamp),
  ms(
    historyItem.createTimestamp - new Date("2019-11-12T19:36:59.733Z").getTime()
  )
);
console.log(
  `DID${historyItem.dealId}`,
  new Date(historyItem.executionTimestamp),
  ms(historyItem.executionTimestamp - historyItem.createTimestamp)
);
console.log(
  `PID${historyItem.positionId}`,
  new Date(historyItem.executionTimestamp),
  ms(0)
);

console.log("history item (DID37623205) -> order details (OID33006875)");
console.log(`EID${109395895}`, new Date("2019-11-12T19:36:14.507Z"));
console.log(`SID${23761833}`, new Date("2019-11-12T19:36:59.422Z"));
console.log(
  `DID${historyItem.position.dealId}`,
  new Date(historyItem.position.executionTimestamp),
  ms(
    historyItem.position.executionTimestamp -
      new Date("2019-11-12T19:36:59.422Z").getTime()
  )
);
console.log(
  `PID${historyItem.position.positionId}`,
  new Date(historyItem.position.executionTimestamp),
  ms(0)
);

console.log("history item (DID37623205) -> order details (OID33006996)");
console.log(`EID${109396069}`, new Date(historyItem.createTimestamp));
console.log(`SID${23761919}`, new Date(historyItem.createTimestamp));
console.log(
  `DID${historyItem.dealId}`,
  new Date(historyItem.executionTimestamp),
  ms(historyItem.executionTimestamp - historyItem.createTimestamp)
);
console.log(
  `PID${historyItem.positionId}`,
  new Date(historyItem.executionTimestamp),
  ms(0)
);

//
// ORDERS
//
console.log("order item (OID33078947)");
console.log(`EID${109487937}`, new Date("2019-11-17T08:15:53.709Z"));

//
// POSITIONS
//
const positionItem = data.positions[0];
console.log("position item (PID18674500)");
console.log(
  `OID${positionItem.orderId}`,
  new Date(positionItem.createTimestamp)
);
console.log(
  `DID${positionItem.dealId}`,
  new Date(positionItem.executionTimestamp),
  ms(positionItem.executionTimestamp - positionItem.createTimestamp)
);
console.log(`PID${positionItem.positionId}`);
