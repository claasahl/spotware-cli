import {
  FACTORY,
  ProtoOAAssetClass,
  ProtoOACtidTraderAccount,
  ProtoOAGetTickDataReq,
  ProtoOAGetTickDataRes,
  ProtoOAGetTrendbarsReq,
  ProtoOAGetTrendbarsRes,
  ProtoOALightSymbol,
  ProtoOASymbol,
  ProtoOASymbolCategory,
  ProtoOATrader,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

export const VERSION = "00";
export interface Account {
  accessTokens: string[];
  account: ProtoOACtidTraderAccount;
  trader: ProtoOATrader;
  assetClasses: ProtoOAAssetClass[];
  categories: ProtoOASymbolCategory[];
  symbols: (ProtoOALightSymbol & ProtoOASymbol)[];
  hasSubscription(socket: SpotwareSocket, symbolId: number): boolean;
  subscribe(socket: SpotwareSocket, symbolId: number): void;
  unsubscribe(socket: SpotwareSocket, symbolId: number): void;
  hasTrendbarSubscription(
    socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): boolean;
  subscribeTrendbars(
    socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): void;
  unsubscribeTrendbars(
    socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): void;
  ticks(req: ProtoOAGetTickDataReq): ProtoOAGetTickDataRes;
  trendbars(req: ProtoOAGetTrendbarsReq): ProtoOAGetTrendbarsRes;
}
function account(ctidTraderAccountId: number): Account {
  const subscriptions: {
    [symbolId: number]: NodeJS.Timeout;
  } = {};
  const trendbarSubscriptions = new Map<number, ProtoOATrendbarPeriod[]>();

  return {
    accessTokens: [],
    account: {
      ctidTraderAccountId,
      isLive: false,
      traderLogin: 1111111,
    },
    trader: {
      ctidTraderAccountId,
      balance: 1000,
      // balanceVersion?: number;
      // managerBonus?: number;
      // ibBonus?: number;
      // nonWithdrawableBonus?: number;
      // accessRights?: ProtoOAAccessRights;
      depositAssetId: 23,
      // swapFree?: boolean;
      // leverageInCents?: number;
      // totalMarginCalculationType?: ProtoOATotalMarginCalculationType;
      // maxLeverage?: number;
      // frenchRisk?: boolean;
      // traderLogin?: number;
      // accountType?: ProtoOAAccountType;
      // brokerName?: string;
      // registrationTimestamp?: number;
      // isLimitedRisk?: boolean;
      // limitedRiskMarginCalculationStrategy?: ProtoOALimitedRiskMarginCalculationStrategy;
      // moneyDigits?: number;
    },
    assetClasses: [
      { id: 1, name: "Forex" },
      { id: 2, name: "Metals" },
      { id: 3, name: "Crypto Currency" },
      { id: 4, name: "Literally Anything" },
    ],
    categories: [
      { id: 1, name: "Category #1.1", assetClassId: 1 },
      { id: 2, name: "Category #1.2", assetClassId: 1 },
      { id: 3, name: "Category #2.1", assetClassId: 2 },
      { id: 4, name: "Category #2.2", assetClassId: 2 },
      { id: 5, name: "Category #3.1", assetClassId: 3 },
      { id: 6, name: "Category #3.2", assetClassId: 3 },
      { id: 7, name: "Category #4", assetClassId: 4 },
    ],
    symbols: [
      {
        symbolId: 1,
        symbolName: "BTC/EUR",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: true,
        symbolCategoryId: 1,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 2,
        symbolName: "SYMBOL2",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: true,
        symbolCategoryId: 2,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 3,
        symbolName: "SYMBOL3",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: false,
        symbolCategoryId: 3,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
      {
        symbolId: 4,
        symbolName: "SYMBOL4",
        baseAssetId: 1,
        quoteAssetId: 2,
        enabled: false,
        symbolCategoryId: 4,
        digits: 2,
        holiday: [],
        pipPosition: 5,
        schedule: [],
      },
    ],
    hasSubscription: (_socket, symbolId) => !!subscriptions[symbolId],
    subscribe: (socket, symbolId) => {
      const timer = setInterval(() => {
        const trendbar: ProtoOATrendbar[] = [];
        const periods = trendbarSubscriptions.get(symbolId);
        if (periods) {
          for (const period of periods) {
            trendbar.push({
              volume: 0,
              period,
              low: 15,
              deltaOpen: 1,
              deltaHigh: 2,
              utcTimestampInMinutes: Math.round(Date.now() % 60000),
            });
          }
        }
        socket.write(
          FACTORY.PROTO_OA_SPOT_EVENT({
            ctidTraderAccountId,
            symbolId,
            trendbar,
            bid: Math.random() * 1000000,
          })
        );
      }, 10);
      subscriptions[symbolId] = timer;
    },
    unsubscribe: (_socket, symbolId) => {
      clearInterval(subscriptions[symbolId]);
      delete subscriptions[symbolId];
    },
    hasTrendbarSubscription: (_socket, symbolId, period) => {
      const periods = trendbarSubscriptions.get(symbolId);
      if (!periods) {
        return false;
      }
      return periods.includes(period);
    },
    subscribeTrendbars: (_socket, symbolId, period) => {
      const periods = trendbarSubscriptions.get(symbolId);
      if (periods && !periods.includes(period)) {
        trendbarSubscriptions.set(symbolId, [...periods, period]);
      }
      trendbarSubscriptions.set(symbolId, [...(periods || []), period]);
    },
    unsubscribeTrendbars: (_socket, symbolId, period) => {
      const periods = trendbarSubscriptions.get(symbolId);
      if (periods && periods.includes(period)) {
        trendbarSubscriptions.set(symbolId, [
          ...periods.filter((p) => p !== period),
        ]);
      }
      trendbarSubscriptions.set(symbolId, periods || []);
    },
    ticks: (_req) => ({ ctidTraderAccountId, hasMore: false, tickData: [] }),
    trendbars: ({ period, symbolId }) => ({
      ctidTraderAccountId,
      period,
      symbolId,
      timestamp: 0,
      trendbar: [],
    }),
  };
}

export const STORE: {
  [ctidTraderAccountId: number]: Account;
} = {
  123456: account(123456),
};
