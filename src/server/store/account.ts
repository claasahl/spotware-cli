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

import * as DB from "../../database";
import * as U from "../../utils";
import assetClasses from "./assetClasses";
import assets, { EUR } from "./assets";
import categories from "./categories";
import symbols, { symbolById } from "./symbols";

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
      depositAssetId: EUR.assetId,
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

  async ticks(req: ProtoOAGetTickDataReq): Promise<ProtoOAGetTickDataRes> {
    const period: DB.Period = {
      fromTimestamp: req.fromTimestamp,
      toTimestamp: req.toTimestamp,
    };
    const symbol = symbolById.get(req.symbolId);
    const dir = `./SERVER/${symbol?.symbolName}.DB/`;
    const tickData = await DB.readQuotesChunk(dir, period, req.type);

    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      hasMore: false,
      tickData,
    };
  }

  async trendbars(
    req: ProtoOAGetTrendbarsReq
  ): Promise<ProtoOAGetTrendbarsRes> {
    const period: DB.Period = {
      fromTimestamp: req.fromTimestamp,
      toTimestamp: req.toTimestamp,
    };
    const symbol = symbolById.get(req.symbolId);
    const dir = `./SERVER/${symbol?.symbolName}.DB/`;
    const trendbars = await DB.readTrendbarsChunk(dir, period, req.period);

    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      period: req.period,
      symbolId: req.symbolId,
      timestamp: req.toTimestamp,
      trendbar: trendbars,
    };
  }
}
