import {
  FACTORY,
  ProtoOACtidTraderAccount,
  ProtoOAGetTickDataReq,
  ProtoOAGetTickDataRes,
  ProtoOAGetTrendbarsReq,
  ProtoOAGetTrendbarsRes,
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrader,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import * as DB from "../../database";
import { forHumans } from "../../database";
import * as U from "../../utils";
import assetClasses from "./assetClasses";
import assets, { EUR } from "./assets";
import categories from "./categories";
import symbols, { symbolById } from "./symbols";

export async function readTrendbarsChunk(
  dir: string,
  period: DB.Period,
  type: ProtoOATrendbarPeriod
): Promise<ProtoOATrendbar[]> {
  const available = await DB.readTrendbarPeriods(dir, type);
  const periods = DB.retainAvailablePeriods(period, available).sort(
    DB.comparePeriod
  );

  if (periods.length > 0) {
    const tmp = available.filter((p) =>
      DB.intersects(p, periods[periods.length - 1])
    );
    const trendbars = (await DB.readTrendbars(dir, tmp[0], type)).filter(
      (t) => {
        if (typeof t.utcTimestampInMinutes !== "number") {
          return false;
        }
        const timestamp = t.utcTimestampInMinutes * 60000;
        return (
          period.fromTimestamp - U.period(type) < timestamp &&
          timestamp <= period.toTimestamp
        );
      }
    );
    return trendbars;
  }

  return [];
}

export async function readQuotesChunk(
  dir: string,
  period: DB.Period,
  type: ProtoOAQuoteType
): Promise<ProtoOATickData[]> {
  const available = await DB.readQuotePeriods(dir, type);
  const periods = DB.retainAvailablePeriods(period, available).sort(
    DB.comparePeriod
  );

  if (periods.length > 0) {
    const tmp = available.filter((p) =>
      DB.intersects(p, periods[periods.length - 1])
    );
    const tickData = (await DB.readQuotes(dir, tmp[0], type)).filter(
      (t) =>
        period.fromTimestamp <= t.timestamp && t.timestamp < period.toTimestamp
    );
    for (let index = tickData.length - 1; index > 0; index--) {
      const curr = tickData[index];
      const prev = tickData[index - 1];
      tickData[index] = {
        tick: curr.tick - prev.tick,
        timestamp: curr.timestamp - prev.timestamp,
      };
    }
    return tickData;
  }

  return [];
}

export async function emitAskQuotes(
  socket: SpotwareSocket,
  ctidTraderAccountId: number,
  symbolId: number
): Promise<(ms: number) => Promise<void>> {
  const symbol = symbolById.get(symbolId);
  const dir = `./SERVER/${symbol?.symbolName}.DB/`;
  const periods = await DB.readQuotePeriods(dir, ProtoOAQuoteType.ASK);
  const state: {
    timestamp: number;
    periodIndex: number;
    quotes: ProtoOATickData[];
    quotesIndex: number;
  } = {
    timestamp: 0,
    periodIndex: -1,
    quotes: [],
    quotesIndex: -1,
  };
  if (periods.length > 0) {
    console.log("loading initial block of quotes", forHumans(periods[0]));
    state.periodIndex = 0;
    state.quotes = await DB.readQuotes(dir, periods[0], ProtoOAQuoteType.ASK);
    state.quotesIndex = state.quotes.length - 1;
    state.timestamp =
      state.quotes.length > 0
        ? state.quotes[state.quotes.length - 1].timestamp
        : 0;
  }
  const emitQuotes = async (ms: number) => {
    if (state.periodIndex === -1) {
      console.log("nothing to emit");
      // nothing to do
      return;
    }

    state.timestamp += ms;
    console.log("advanced time to", new Date(state.timestamp).toISOString());
    while (
      state.quotesIndex >= 0 &&
      state.quotes[state.quotesIndex].timestamp < state.timestamp
    ) {
      socket.write(
        FACTORY.PROTO_OA_SPOT_EVENT({
          ctidTraderAccountId,
          symbolId,
          trendbar: [],
          ask: state.quotes[state.quotesIndex].tick,
        })
      );
      state.quotesIndex--;
    }
    if (state.quotesIndex === -1 && state.periodIndex < periods.length - 1) {
      state.periodIndex++;
      console.log(
        "loading next block of quotes",
        forHumans(periods[state.periodIndex])
      );
      state.quotes = await DB.readQuotes(
        dir,
        periods[state.periodIndex],
        ProtoOAQuoteType.ASK
      );
      state.quotesIndex = state.quotes.length - 1;
      state.timestamp =
        state.quotes.length > 0
          ? state.quotes[state.quotes.length - 1].timestamp
          : 0;
      await emitQuotes(0);
    }
  };
  return emitQuotes;
}

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

  async subscribe(socket: SpotwareSocket, symbolId: number): Promise<void> {
    const testing = await emitAskQuotes(
      socket,
      this.ctidTraderAccountId,
      symbolId
    );
    const timer = setInterval(async () => {
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
      try {
        await testing(60 * 60000);
      } catch (err) {
        console.log("error while emitting ask quotes", err);
      }
    }, 1000);
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
    const tickData = await readQuotesChunk(dir, period, req.type);

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
    const trendbars = await readTrendbarsChunk(dir, period, req.period);

    return {
      ctidTraderAccountId: this.ctidTraderAccountId,
      period: req.period,
      symbolId: req.symbolId,
      timestamp: req.toTimestamp,
      trendbar: trendbars,
    };
  }
}
