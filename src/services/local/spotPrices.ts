import fs from "fs";
import readline from "readline";
import debug from "debug";

import {
  AskPriceChangedEvent,
  BidPriceChangedEvent,
  PriceChangedEvent,
  DebugSpotPricesStream,
  SpotPricesProps,
  SpotPricesStream
} from "../types/spotPrices";

const log = debug("local-data");

async function* sampleData(): AsyncGenerator<
  AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
  void,
  unknown
> {
  yield { timestamp: 1577663999771, ask: 6611.79 };
  yield { timestamp: 1577663999425, bid: 6612.03 };
  yield { timestamp: 1577663999110, bid: 6612.28 };
  yield { timestamp: 1577663998928, ask: 6612.52 };
  yield { timestamp: 1577663998447, bid: 6612.73 };
  yield { timestamp: 1577663998021, bid: 6613.18 };
  yield { timestamp: 1577663997680, ask: 6613.21 };
  yield { timestamp: 1577663997264, bid: 6613.11 };
  yield { timestamp: 1577663997026, bid: 6613.18 };
  yield { timestamp: 1577663996609, bid: 6613.21 };
  yield { timestamp: 1577663995996, ask: 6613.24 };
  yield { timestamp: 1577663995829, bid: 6613.98 };
  yield { timestamp: 1577663995601, bid: 6614.08 };
  yield { timestamp: 1577663995198, ask: 6613, bid: 6613.91 };
  yield { timestamp: 1577663994564, ask: 6613, bid: 6613.17 };
  yield { timestamp: 1577663994182, ask: 6613, bid: 6613.14 };
  yield { timestamp: 1577663993987, bid: 6613.21 };
  yield { timestamp: 1577663993516, ask: 6612.72 };
}

async function* fr0mFile(
  path: fs.PathLike
): AsyncGenerator<
  AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
  void,
  unknown
> {
  const fileStream = fs.createReadStream(path);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      if (typeof data === "object") {
        yield data;
      }
    } catch {
      log(
        "failed to parse line '%s' as JSON (%s)... skipping",
        line,
        path.toString()
      );
    }
  }
}

function emitSpotPrices(
  stream: DebugSpotPricesStream,
  e: AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent
): void {
  if ("ask" in e && !("bid" in e)) {
    stream.emitAsk({ timestamp: e.timestamp, ask: e.ask });
  } else if (!("ask" in e) && "bid" in e) {
    stream.emitBid({ timestamp: e.timestamp, bid: e.bid });
  } else if ("ask" in e && "bid" in e) {
    stream.emitAsk({ timestamp: e.timestamp, ask: e.ask });
    stream.emitBid({ timestamp: e.timestamp, bid: e.bid });
    stream.emitPrice({ timestamp: e.timestamp, ask: e.ask, bid: e.bid });
  }
  setImmediate(() => stream.emit("next"));
}

export function fromSampleData(props: SpotPricesProps): SpotPricesStream {
  const data = sampleData();
  const stream = new DebugSpotPricesStream(props);
  const emitNext = () => {
    data.next().then(a => {
      setImmediate(() => {
        if (a.value) {
          emitSpotPrices(stream, a.value);
        }
      })
    });
  }
  setImmediate(() => {
    stream.on("next", emitNext)
    emitNext();
  })
  return stream;
}

export function fromFile(props: SpotPricesProps & {path: fs.PathLike}): SpotPricesStream {
  const {path, ...originalProps} = props;
  const data = fr0mFile(path);
  const stream = new DebugSpotPricesStream(originalProps);
  const emitNext = () => {
    data.next().then(a => {
      setImmediate(() => {
        if (a.value) {
          emitSpotPrices(stream, a.value);
        }
      })
    });
  }
  setImmediate(() => {
    stream.on("next", emitNext)
    emitNext();
  })
  return stream;
}