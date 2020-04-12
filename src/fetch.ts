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
    return tickData.map(t => ({timestamp: t.timestamp, ask: t.tick / 100000}));
  } else if(type === $.ProtoOAQuoteType.BID) {
    return tickData.map(t => ({timestamp: t.timestamp, bid: t.tick / 100000}));
  }
  return []
}

function fetch(client: SpotwareClient, ctidTraderAccountId: number, symbolId: number, type: $.ProtoOAQuoteType, interval: Interval, cb: (spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[]) => void) {
  const spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] = []
  const wtf = (msg: $.ProtoOAGetTickDataRes) => {
    spots.push(...interpolate(msg, type))
    if(msg.hasMore) {
      const toTimestamp = msg.tickData[0].timestamp;
      client.getTickData({ ctidTraderAccountId, symbolId, ...interval, toTimestamp, type }, wtf)
    } else {
      cb(spots);
    }
  }
  client.getTickData({ ctidTraderAccountId, symbolId, ...interval, type }, wtf)
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

function main() {
  const path = "./store/test4.json"
  const from = new Date("2020-04-05T00:00:00.000Z").getTime()
  const to = new Date("2020-04-05T12:00:00.000Z").getTime()
  const intervals = split(from, to)

  const symbolName = "BTC/EUR";
  const client = new SpotwareClient(config);
  
  const symbolsList = (ctidTraderAccountId: number) => client.symbolsList({...config, ctidTraderAccountId}, msg => {
    const symbols = msg.symbol.filter(s => s.symbolName === symbolName);
    assert.equal(symbols.length, 1)
    const symbolId = symbols[0].symbolId

    if(fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    function nextInterval() {
      const interval = intervals.shift();
      if(interval) {
        const F = (type: $.ProtoOAQuoteType, cb: (spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[]) => void) => fetch(client, ctidTraderAccountId, symbolId, type, interval, cb);
        F($.ProtoOAQuoteType.ASK, askSpots => {
          F($.ProtoOAQuoteType.BID, bidSpots => {
            const spots: (B.AskPriceChangedEvent | B.BidPriceChangedEvent)[] = []
            spots.push(...askSpots)
            spots.push(...bidSpots)
            appendSpotPrices(path, spots);
            nextInterval();
          });
        });
      } else {
        client.end();
      }
    }
    nextInterval();
  })
  const authAccount = (ctidTraderAccountId: number) => client.accountAuth({...config, ctidTraderAccountId}, msg => symbolsList(msg.ctidTraderAccountId))
  const lookupAccounts = () => client.getAccountListByAccessToken(config, msg => {
    assert.strictEqual(msg.ctidTraderAccount.length, 1);
    authAccount(msg.ctidTraderAccount[0].ctidTraderAccountId);
  })
  client.applicationAuth(config, lookupAccounts)
}
main();
