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

import assetClasses from "./assetClasses";
import categories from "./categories";
import symbols from "./symbols";

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

export function account(ctidTraderAccountId: number): Account {
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
    assetClasses,
    categories,
    symbols,
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
