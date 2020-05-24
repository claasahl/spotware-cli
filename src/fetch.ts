import assert from "assert"
import * as $ from "@claasahl/spotware-adapter";
import fs from "fs"
import ms from "ms";

import config from "./config";
import * as B from "./services/base"
import { SpotwareClient } from "./services/spotware/client";

interface Interval {
  fromTimestamp: number,
  toTimestamp: number
}

function split(fromTimestamp: number, toTimestamp: number, offset: number = ms("1h")): Interval[] {
  const intervals: Interval[] = []
  let timestamp = fromTimestamp;
  while(timestamp + offset < toTimestamp) {
    intervals.push({fromTimestamp: timestamp, toTimestamp: timestamp+offset})
    timestamp += offset;
  }
  intervals.push({fromTimestamp: timestamp, toTimestamp})
  return intervals;
}

function interpolate(msg: $.ProtoOAGetTickDataRes, type: $.ProtoOAQuoteType): (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] {
  const tickData = msg.tickData
  for(let index = 1; index < tickData.length; index++) {
    const prev = tickData[index - 1]
    const curr = tickData[index]
    curr.timestamp = prev.timestamp + curr.timestamp
    curr.tick = prev.tick + curr.tick
  }
  if(type === $.ProtoOAQuoteType.ASK) {
    return tickData.map(t => ({type: "ASK_PRICE_CHANGED", timestamp: t.timestamp, ask: t.tick / 100000}));
  } else if(type === $.ProtoOAQuoteType.BID) {
    return tickData.map(t => ({type: "BID_PRICE_CHANGED", timestamp: t.timestamp, bid: t.tick / 100000}));
  }
  return []
}

async function fetch(client: SpotwareClient, ctidTraderAccountId: number, symbolId: number, type: $.ProtoOAQuoteType, interval: Interval): Promise<(B.AskPriceChangedEvent | B.BidPriceChangedEvent)[]> {
    const spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] = []
    const {fromTimestamp} = interval
    let {toTimestamp} = interval
    while(fromTimestamp < toTimestamp) {
      const msg = await client.getTickData({ ctidTraderAccountId, symbolId, type, fromTimestamp, toTimestamp })
      spots.push(...interpolate(msg, type))
      if(msg.hasMore) {
        assert.notStrictEqual(spots[spots.length-1].timestamp, toTimestamp);
        toTimestamp = spots[spots.length-1].timestamp;
      } else {
        return spots;
      }
    }
    return []
}

function appendSpotPrices(path: string, spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[]) {
  const ticks = spots
  .sort((a, b) => a.timestamp - b.timestamp)
  .map((tick, index, ticks) => {
    if(index + 1 < ticks.length && tick.timestamp === ticks[index + 1].timestamp) {
      return {...tick, ...ticks[index+1]}
    }
    if(index - 1 >= 0 && tick.timestamp === ticks[index - 1].timestamp) {
      return undefined
    }
    return tick
  })
  .filter(t => typeof t !== "undefined")

  const stream = fs.createWriteStream(path, {flags: "a"})
  for(const tick of ticks) {
    stream.write(JSON.stringify(tick) + "\n")
  }
  stream.close()
}

async function main() {
  const path = "./store/test4.json"
  const from = new Date("2020-03-01T00:00:00.000Z").getTime()
  const to = new Date("2020-04-01T00:00:00.000Z").getTime()
  const intervals = split(from, to)

  const symbolName = "BTC/EUR";
  const client = new SpotwareClient(config);

  await client.applicationAuth(config);
  const accounts = await client.getAccountListByAccessToken(config);
  assert.strictEqual(accounts.ctidTraderAccount.length, 1);
  const {ctidTraderAccountId} = accounts.ctidTraderAccount[0]
  await client.accountAuth({...config, ctidTraderAccountId});
  const symbolsList = await client.symbolsList({...config, ctidTraderAccountId});
  const symbols = symbolsList.symbol.filter(s => s.symbolName === symbolName);
  assert.equal(symbols.length, 1)
  const symbolId = symbols[0].symbolId

  if(fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  for(const interval of intervals) {
      const F = (type: $.ProtoOAQuoteType) => fetch(client, ctidTraderAccountId, symbolId, type, interval);
      const askSpots = await F($.ProtoOAQuoteType.ASK)
      const bidSpots = await F($.ProtoOAQuoteType.BID)
      const spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] = []
      spots.push(...askSpots)
      spots.push(...bidSpots)
      appendSpotPrices(path, spots);
  }
  client.end();
}
main();
