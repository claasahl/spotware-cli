import {
  FACTORY,
  ProtoOACtidTraderAccount,
  ProtoOAGetTickDataReq,
  ProtoOAGetTickDataRes,
  ProtoOAGetTrendbarsReq,
  ProtoOAGetTrendbarsRes,
  ProtoOATrader,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import assetClasses from "./assetClasses";
import categories from "./categories";
import symbols from "./symbols";

export class Account {
  private ctidTraderAccountId;
  private subscriptions: {
    [symbolId: number]: NodeJS.Timeout;
  } = {};
  private trendbarSubscriptions = new Map<number, ProtoOATrendbarPeriod[]>();
  readonly assetClasses;
  readonly categories;
  readonly symbols;
  readonly accessTokens: string[];
  readonly account: ProtoOACtidTraderAccount;
  readonly trader: ProtoOATrader;

  constructor(ctidTraderAccountId: number) {
    this.ctidTraderAccountId = ctidTraderAccountId;
    this.assetClasses = assetClasses;
    this.categories = categories;
    this.symbols = symbols;
    this.accessTokens = [];
    this.account = {
      ctidTraderAccountId,
      isLive: false,
      traderLogin: 1111111,
    };
    this.trader = {
      ctidTraderAccountId,
      balance: 1000,
      depositAssetId: 23,
    };
  }

  hasSubscription(_socket: SpotwareSocket, symbolId: number): boolean {
    return !!this.subscriptions[symbolId];
  }

  subscribe(socket: SpotwareSocket, symbolId: number): void {
    const timer = setInterval(() => {
      const trendbar: ProtoOATrendbar[] = [];
      const periods = this.trendbarSubscriptions.get(symbolId);
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
          ctidTraderAccountId: this.ctidTraderAccountId,
          symbolId,
          trendbar,
          bid: Math.random() * 1000000,
        })
      );
    }, 10);
    this.subscriptions[symbolId] = timer;
  }

  unsubscribe(_socket: SpotwareSocket, symbolId: number): void {
    clearInterval(this.subscriptions[symbolId]);
    delete this.subscriptions[symbolId];
  }

  hasTrendbarSubscription(
    _socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): boolean {
    const periods = this.trendbarSubscriptions.get(symbolId);
    if (!periods) {
      return false;
    }
    return periods.includes(period);
  }

  subscribeTrendbars(
    _socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): void {
    const periods = this.trendbarSubscriptions.get(symbolId);
    if (periods && !periods.includes(period)) {
      this.trendbarSubscriptions.set(symbolId, [...periods, period]);
    }
    this.trendbarSubscriptions.set(symbolId, [...(periods || []), period]);
  }

  unsubscribeTrendbars(
    _socket: SpotwareSocket,
    symbolId: number,
    period: ProtoOATrendbarPeriod
  ): void {
    const periods = this.trendbarSubscriptions.get(symbolId);
    if (periods && periods.includes(period)) {
      this.trendbarSubscriptions.set(symbolId, [
        ...periods.filter((p) => p !== period),
      ]);
    }
    this.trendbarSubscriptions.set(symbolId, periods || []);
  }

  ticks(_req: ProtoOAGetTickDataReq): ProtoOAGetTickDataRes {
    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      hasMore: false,
      tickData: [],
    };
  }

  trendbars({
    period,
    symbolId,
  }: ProtoOAGetTrendbarsReq): ProtoOAGetTrendbarsRes {
    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      period,
      symbolId,
      timestamp: 0,
      trendbar: [],
    };
  }
}
