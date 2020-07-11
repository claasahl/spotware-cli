import fs from "fs";
import readline from "readline";
import { Readable, Transform, TransformCallback, TransformOptions } from "stream";
import {obj as multistream} from "multistream";

import * as T from "../types";
import * as L from "../logging";

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

export function fromSampleData(props: T.SpotPricesProps): T.SpotPricesStream {
  return Readable.from(sampleData()).pipe(new ChunkToSpotPrices(props));
}

function fr0mFile(path: fs.PathLike): Readable {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  return Readable.from(rl);
}

export function fromFiles(props: T.SpotPricesProps & { paths: fs.PathLike[] }): T.SpotPricesStream {
  const { paths, ...originalProps } = props;
  const streams = paths.map(fr0mFile);
  const filter = (chunk: string): boolean => {
    if(chunk.indexOf("{") === 0) {
      return true;
    }
    return chunk.includes("spotPrices:") && (chunk.includes("ASK_PRICE_CHANGED") || chunk.includes("BID_PRICE_CHANGED"))
  }
  return multistream(streams).pipe(new ChunkToSpotPrices(originalProps, filter));
}
const transformOptions: TransformOptions = {objectMode: true}
class ChunkToSpotPrices extends Transform implements T.SpotPricesStream {
  readonly props: T.SpotPricesProps;
  private readonly filter: (chunk: string) => boolean;
  private readonly cachedPrices: { ask?: number, bid?: number } = { ask: undefined, bid: undefined }
  
  constructor(props: T.SpotPricesProps, filter: (chunk: string) => boolean = () => true) {
    super(transformOptions);
    this.props = Object.freeze(props);
    this.filter = filter;
    L.logSpotPriceEvents(this);
  }

  push(event: T.SpotPricesEvent | null): boolean {
    return super.push(event)
  }
  _transform(chunk: Buffer | string | any, encoding: string, callback: TransformCallback): void {
    if(typeof chunk !== "string" || encoding !== "utf8") {
      return callback();
    } else if (!this.filter(chunk)) {
      return callback();
    }
    
    const logEntry = /({.*})/.exec(chunk);
    if (logEntry) {
      try {
        const data = JSON.parse(logEntry[1]);
        if (typeof data !== "object") {
          return callback();
        } else if(!("timestamp" in data)) {
          return callback();
        }
        if ("ask" in data && !("bid" in data)) {
          this.push({ type: "ASK_PRICE_CHANGED", timestamp: data.timestamp, ask: data.ask });
          
          this.cachedPrices.ask = data.ask;
          const latestBid = this.cachedPrices.bid
          if(latestBid) {
            this.push({ type: "PRICE_CHANGED", timestamp: data.timestamp, ask: data.ask, bid: latestBid });
          }
        } else if (!("ask" in data) && "bid" in data) {
          this.push({ type: "BID_PRICE_CHANGED", timestamp: data.timestamp, bid: data.bid });
          
          this.cachedPrices.bid = data.bid;
          const latestAsk = this.cachedPrices.ask;
          if(latestAsk) {
            this.push({ type: "PRICE_CHANGED", timestamp: data.timestamp, ask: latestAsk, bid: data.bid });
          }
        } else if ("ask" in data && "bid" in data) {
          this.cachedPrices.ask = data.ask;
          this.cachedPrices.bid = data.bid;
          this.push({ type: "ASK_PRICE_CHANGED", timestamp: data.timestamp, ask: data.ask });
          this.push({ type: "BID_PRICE_CHANGED", timestamp: data.timestamp, bid: data.bid });
          this.push({ type: "PRICE_CHANGED", timestamp: data.timestamp, ask: data.ask, bid: data.bid });
        }
        return callback();
      } catch (err) {
        const msg = `failed to parse '${logEntry[1]}' as JSON`;
        return callback(new Error(msg));
      }
    }
  }

  trendbars(_props: T.SpotPricesSimpleTrendbarsProps): T.TrendbarsStream {
    throw new Error("not implemented");
  }
}
