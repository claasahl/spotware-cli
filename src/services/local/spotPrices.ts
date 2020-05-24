import fs from "fs";
import readline from "readline";
import debug from "debug";
import { Readable, Transform, TransformCallback, TransformOptions, pipeline } from "stream";

import * as B from "../base";
import { trendbarsFromSpotPrices } from "./trendbars";

const log = debug("local-data");

class LocalSpotPricesStream extends B.DebugSpotPricesStream {
  trendbars(props: B.SpotPricesSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
    return trendbarsFromSpotPrices({ ...props, ...this.props, spots: this });
  }
}

async function* sampleData(): AsyncGenerator<string, void, unknown> {
  yield '{ "type": "ASK_PRICE_CHANGED", "timestamp": 1577663999771, "ask": 6611.79 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663999425, "bid": 6612.03 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663999110, "bid": 6612.28 }';
  yield '{ "type": "ASK_PRICE_CHANGED", "timestamp": 1577663998928, "ask": 6612.52 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663998447, "bid": 6612.73 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663998021, "bid": 6613.18 }';
  yield '{ "type": "ASK_PRICE_CHANGED", "timestamp": 1577663997680, "ask": 6613.21 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663997264, "bid": 6613.11 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663997026, "bid": 6613.18 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663996609, "bid": 6613.21 }';
  yield '{ "type": "ASK_PRICE_CHANGED", "timestamp": 1577663995996, "ask": 6613.24 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663995829, "bid": 6613.98 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663995601, "bid": 6614.08 }';
  yield '{ "type": "PRICE_CHANGED", "timestamp": 1577663995198, "ask": 6613, "bid": 6613.91 }';
  yield '{ "type": "PRICE_CHANGED", "timestamp": 1577663994564, "ask": 6613, "bid": 6613.17 }';
  yield '{ "type": "PRICE_CHANGED", "timestamp": 1577663994182, "ask": 6613, "bid": 6613.14 }';
  yield '{ "type": "BID_PRICE_CHANGED", "timestamp": 1577663993987, "bid": 6613.21 }';
  yield '{ "type": "ASK_PRICE_CHANGED", "timestamp": 1577663993516, "ask": 6612.72 }';
}

export async function* fr0mLogFiles(
  paths: fs.PathLike[]
): AsyncGenerator<
  B.AskPriceChangedEvent | B.BidPriceChangedEvent | B.PriceChangedEvent,
  void,
  unknown
> {
  for (const path of paths) {
    const fileStream = fs.createReadStream(path);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      try {
        if (!line.includes("spotPrices:ask") && !line.includes("spotPrices:bid")) {
          continue;
        }
        const logEntry = /({.*})/.exec(line)
        if (logEntry) {
          const data = JSON.parse(logEntry[1]);
          if (typeof data === "object") {
            yield data;
          }
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
}

function emitSpotPrices(
  stream: B.DebugSpotPricesStream,
  e: B.AskPriceChangedEvent | B.BidPriceChangedEvent | B.PriceChangedEvent
): void {
  if ("ask" in e && !("bid" in e)) {
    stream.tryAsk({ timestamp: e.timestamp, ask: e.ask });
  } else if (!("ask" in e) && "bid" in e) {
    stream.tryBid({ timestamp: e.timestamp, bid: e.bid });
  } else if ("ask" in e && "bid" in e) {
    stream.tryAsk({ timestamp: e.timestamp, ask: e.ask });
    stream.tryBid({ timestamp: e.timestamp, bid: e.bid });
    stream.tryPrice({ timestamp: e.timestamp, ask: e.ask, bid: e.bid });
  }
}

export function fromSampleData(props: B.SpotPricesProps): B.SpotPricesStream {
  return pipeline(
    Readable.from(sampleData()),
    new ChunkToSpotPrices(props)
  )
}

export function fromFile(props: B.SpotPricesProps & { path: fs.PathLike }): B.SpotPricesStream {
  const { path, ...originalProps } = props;
  const fileStream = fs.createReadStream(props.path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  return pipeline(
    Readable.from(rl),
    new ChunkToSpotPrices(originalProps),
    err => console.log("pipeline callback", err)
  );
}

export function fromLogFiles(props: B.SpotPricesProps & { paths: fs.PathLike[] }): B.SpotPricesStream {
  const { paths, ...originalProps } = props;
  const stream = new LocalSpotPricesStream(originalProps);

  const data = fr0mLogFiles(paths);
  const s = Readable.from(data);
  s.on("data", value => emitSpotPrices(stream, value))
  return stream;
}
const transformOptions: TransformOptions = {objectMode: true}
class ChunkToSpotPrices extends Transform implements B.SpotPricesStream {
  props: B.SpotPricesProps;
  private readonly cachedEvents: Map<B.SpotPricesEvent["type"], B.SpotPricesEvent>;
  constructor(props: B.SpotPricesProps) {
    super(transformOptions);
    this.props = Object.freeze(props);
    this.cachedEvents = new Map();
  }
  _transform(chunk: Buffer | string | any, encoding: string, callback: TransformCallback): void {
    if(typeof chunk !== "string" || encoding !== "utf8") {
      return callback();
    } else if (!chunk.includes("spotPrices:ask") && !chunk.includes("spotPrices:bid")) {
      return callback();
    }
    
    const logEntry = /({.*})/.exec(chunk);
    if (logEntry) {
      try {
        const data = JSON.parse(logEntry[1]);
        if (typeof data === "object") {
          return callback(null, data);
        }
      } catch (err) {
        const msg = `failed to parse '${logEntry[1]}' as JSON`;
        return callback(new Error(msg));
      }
    }
  }

  async trendbars(_props: B.SpotPricesSimpleTrendbarsProps): Promise<B.TrendbarsStream> {
    throw new Error("not implemented");
  }

  private cachedEventOrNull<T extends B.SpotPricesEvent>(type: T["type"]): T | null {
    const event = this.cachedEvents.get(type)
    if (event && event.type === type) {
      return event as T;
    }
    return null;
  }

  askOrNull(): B.AskPriceChangedEvent | null {
    return this.cachedEventOrNull("ASK_PRICE_CHANGED");
  }

  bidOrNull(): B.BidPriceChangedEvent | null {
    return this.cachedEventOrNull("BID_PRICE_CHANGED");
  }

  priceOrNull(): B.PriceChangedEvent | null {
    return this.cachedEventOrNull("PRICE_CHANGED");
  }
}
