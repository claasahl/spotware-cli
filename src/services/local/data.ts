import fs from "fs";
import readline from 'readline';
import debug from "debug"

import { AskPriceChangedEvent, BidPriceChangedEvent, PriceChangedEvent, SpotPricesStream, DebugSpotPricesStream } from "../spotPrices";
import { Symbol } from "../types";

const log = debug("local-data")

export async function* sampleData(): AsyncGenerator<
  AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
  void,
  unknown
> {
  yield { ask: 6611.79, timestamp: 1577663999771 };
  yield { bid: 6612.03, timestamp: 1577663999425 };
  yield { bid: 6612.28, timestamp: 1577663999110 };
  yield { ask: 6612.52, timestamp: 1577663998928 };
  yield { bid: 6612.73, timestamp: 1577663998447 };
  yield { bid: 6613.18, timestamp: 1577663998021 };
  yield { ask: 6613.21, timestamp: 1577663997680 };
  yield { bid: 6613.11, timestamp: 1577663997264 };
  yield { bid: 6613.18, timestamp: 1577663997026 };
  yield { bid: 6613.21, timestamp: 1577663996609 };
  yield { ask: 6613.24, timestamp: 1577663995996 };
  yield { bid: 6613.98, timestamp: 1577663995829 };
  yield { bid: 6614.08, timestamp: 1577663995601 };
  yield { ask: 6613, bid: 6613.91, timestamp: 1577663995198 };
  yield { ask: 6613, bid: 6613.17, timestamp: 1577663994564 };
  yield { ask: 6613, bid: 6613.14, timestamp: 1577663994182 };
  yield { bid: 6613.21, timestamp: 1577663993987 };
  yield { ask: 6612.72, timestamp: 1577663993516 };
}

function isBidPriceChangedEvent(data: any): data is BidPriceChangedEvent {
  return typeof data.timestamp === "number" && typeof data.ask === "undefined" && typeof data.bid === "number"
}
function isAskPriceChangedEvent(data: any): data is AskPriceChangedEvent {
  return typeof data.timestamp === "number" && typeof data.ask === "number" && typeof data.bid === "undefined"
}
function isPriceChangedEvent(data: any): data is PriceChangedEvent {
  return typeof data.timestamp === "number" && typeof data.ask === "number" && typeof data.bid === "number"
}

export async function* fromFile(path: fs.PathLike): AsyncGenerator<
AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
void,
unknown
> {
  const fileLog = log.extend(`${path.toString()}`)
  fileLog("preparing to read data from file: %s", path)
  const fileStream = fs.createReadStream(path);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    fileLog("processing line: %s", line)
    const data = JSON.parse(line)
    if(isBidPriceChangedEvent(data) || isAskPriceChangedEvent(data) || isPriceChangedEvent(data)) {
      yield data
    }
  }
}


function emitSpotPrices(
  stream: DebugSpotPricesStream,
  e: AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent
): void {
  if ("ask" in e && !("bid" in e)) {
    stream.emitAsk({ ask: e.ask, timestamp: e.timestamp });
  } else if (!("ask" in e) && "bid" in e) {
    stream.emitBid({ bid: e.bid, timestamp: e.timestamp });
  } else if ("ask" in e && "bid" in e) {
    stream.emitAsk({ ask: e.ask, timestamp: e.timestamp });
    stream.emitBid({ bid: e.bid, timestamp: e.timestamp });
    stream.emitPrice({ ask: e.ask, bid: e.bid, timestamp: e.timestamp });
  }
  setImmediate(() => stream.emit("next"));
}

export function spotPrices(symbol: Symbol, data: AsyncGenerator<
  AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
  void,
  unknown
  >): SpotPricesStream {
  function emitNext() {
    data.next().then(a => {
      if (a.value) {
        emitSpotPrices(stream, a.value);
      }
    });
  }
  const stream = new DebugSpotPricesStream({ symbol });
  setImmediate(() => {
    stream.on("next", emitNext);
    emitNext();
  });
  return stream;
}