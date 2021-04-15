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

import * as U from "../../utils";
import assetClasses from "./assetClasses";
import assets from "./assets";
import categories from "./categories";
import symbols from "./symbols";

export class Account {
  private ctidTraderAccountId;
  private subscriptions: {
    [symbolId: number]: NodeJS.Timeout;
  } = {};
  private trendbarSubscriptions = new Map<number, ProtoOATrendbarPeriod[]>();
  readonly assetClasses;
  readonly assets;
  readonly categories;
  readonly symbols;
  readonly accessTokens: string[];
  readonly account: ProtoOACtidTraderAccount;
  readonly trader: ProtoOATrader;

  constructor(ctidTraderAccountId: number) {
    this.ctidTraderAccountId = ctidTraderAccountId;
    this.assetClasses = assetClasses;
    this.assets = assets;
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
          const MILLIS = U.period(period);
          const timestamp = Math.round(Date.now() / MILLIS) * MILLIS;
          trendbar.push({
            volume: 100,
            period,
            low: 15,
            deltaOpen: 1,
            deltaHigh: 2,
            utcTimestampInMinutes: Math.round(timestamp / 60000),
          });
        }
      }
      socket.write(
        FACTORY.PROTO_OA_SPOT_EVENT({
          ctidTraderAccountId: this.ctidTraderAccountId,
          symbolId,
          trendbar,
          bid: 12356,
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

  trendbars(req: ProtoOAGetTrendbarsReq): ProtoOAGetTrendbarsRes {
    const trendbar: ProtoOATrendbar[] = [];
    const MILLIS = U.period(req.period);
    const timestamp = Math.round(req.fromTimestamp / MILLIS) * MILLIS;
    let a = timestamp;
    while (a < req.toTimestamp) {
      trendbar.push({
        volume: 10000,
        low: 100000,
        deltaOpen: 6000,
        deltaHigh: 10000,
        deltaClose: 400,
        utcTimestampInMinutes: Math.round(a / 60000),
      });
      a += MILLIS;
    }
    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      period: req.period,
      symbolId: req.symbolId,
      timestamp,
      trendbar,
    };
  }
}
