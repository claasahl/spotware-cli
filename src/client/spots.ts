import { ProtoOAQuoteType, ProtoOATickData } from "@claasahl/spotware-protobuf";
import ms from "ms";
import { v4 as uuid } from "uuid";
import {
  SpotwareClientSocket,
  Messages,
  ProtoOAPayloadType,
  FACTORY,
} from "@claasahl/spotware-adapter";
import { Events, SpotEvent, Symbol } from "./events";

const FACTOR = Math.pow(10, 5);
const INTERVAL = ms("1min");

interface Interval {
  from: number;
  to: number;
}
function intervals(from: number, to: number): Interval[] {
  const chunks: Interval[] = [{ from, to: Math.min(to, from + INTERVAL) }];
  while (chunks[chunks.length - 1].to < to) {
    const last = chunks[chunks.length - 1];
    chunks.push({ from: last.to, to: Math.min(to, last.to + INTERVAL) });
  }
  return chunks;
}

interface Config {
  ctidTraderAccountId: number;
  symbolId: number;
  type: ProtoOAQuoteType;
  fromTimestamp: number;
  toTimestamp: number;
}
class Historical {
  private stream;
  private events;
  private chunks;
  private clientMsgId;
  private type;
  readonly ctidTraderAccountId;
  readonly symbolId;

  constructor(stream: SpotwareClientSocket, config: Config, events: Events) {
    this.stream = stream;
    this.events = events;
    this.chunks = intervals(config.fromTimestamp, config.toTimestamp);
    this.clientMsgId = uuid();
    this.ctidTraderAccountId = config.ctidTraderAccountId;
    this.symbolId = config.symbolId;
    this.type = config.type;
    this.stream.on("data", this.onMessage.bind(this));
  }

  onInit() {
    this.requestChunk();
  }

  onMessage(msg: Messages) {
    switch (msg.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES:
        {
          const { ctidTraderAccountId, tickData, hasMore } = msg.payload;
          if (ctidTraderAccountId !== this.ctidTraderAccountId) {
            // skip other accounts
            break;
          }
          if (msg.clientMsgId === this.clientMsgId && hasMore) {
            this.stream.destroy(
              new Error("adjust interval size or implement this properly")
            );
          } else if (msg.clientMsgId === this.clientMsgId) {
            const acc: ProtoOATickData = { timestamp: 0, tick: 0 };
            const spots: SpotEvent[] = [];
            for (const t of tickData) {
              const price = (acc.tick + t.tick) / FACTOR;
              const event = {
                ctidTraderAccountId,
                date: new Date(acc.timestamp + t.timestamp),
                symbolId: this.symbolId,
                ask: this.type === ProtoOAQuoteType.ASK ? price : undefined,
                bid: this.type === ProtoOAQuoteType.BID ? price : undefined,
              };
              spots.push(event);

              acc.timestamp += t.timestamp;
              acc.tick += t.tick;
            }
            spots.reverse().forEach((event) => this.events.emit("spot", event));
            this.requestChunk();
          }
        }
        break;
    }
  }

  private requestChunk() {
    const chunk = this.chunks.shift();
    if (chunk) {
      this.stream.write(
        FACTORY.PROTO_OA_GET_TICKDATA_REQ(
          {
            ctidTraderAccountId: this.ctidTraderAccountId,
            symbolId: this.symbolId,
            fromTimestamp: chunk.from,
            toTimestamp: chunk.to,
            type: this.type,
          },
          this.clientMsgId
        )
      );
    } else {
      this.stream.off("data", this.onMessage.bind(this));
    }
  }
}

export default class Spots {
  private stream;
  private events;
  private fromTimestamp;
  private toTimestamp;
  private historicalAsk;
  private shouldCache;
  private spots: SpotEvent[];
  readonly ctidTraderAccountId;
  readonly symbolId;

  constructor(stream: SpotwareClientSocket, symbol: Symbol, events: Events) {
    this.stream = stream;
    this.events = events;
    this.toTimestamp = Date.now();
    this.fromTimestamp = this.toTimestamp - ms("2min");
    this.historicalAsk = new Historical(
      stream,
      {
        ctidTraderAccountId: symbol.ctidTraderAccountId,
        symbolId: symbol.symbolId,
        fromTimestamp: this.fromTimestamp,
        toTimestamp: this.toTimestamp,
        type: ProtoOAQuoteType.ASK,
      },
      events
    );
    this.shouldCache = true;
    this.spots = [];
    this.ctidTraderAccountId = symbol.ctidTraderAccountId;
    this.symbolId = symbol.symbolId;
  }

  onInit() {
    this.stream.write(
      FACTORY.PROTO_OA_SUBSCRIBE_SPOTS_REQ({
        ctidTraderAccountId: this.ctidTraderAccountId,
        symbolId: [this.symbolId],
      })
    );
    this.historicalAsk.onInit();
  }

  onMessage(msg: Messages) {
    switch (msg.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_RES:
        {
          // consider emitting processed PROTO_OA_GET_TICKDATA_RES in Historical
          // ... and here emitting spot prices
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_SPOT_EVENT:
        {
          const { ctidTraderAccountId, symbolId, ask, bid } = msg.payload;
          if (ctidTraderAccountId !== this.ctidTraderAccountId) {
            // skip other accounts
            break;
          } else if (symbolId !== this.symbolId) {
            // skip other symbols
            break;
          }

          const event = {
            ctidTraderAccountId: this.ctidTraderAccountId,
            date: new Date(),
            symbolId,
            ask: ask ? ask / FACTOR : undefined,
            bid: bid ? bid / FACTOR : undefined,
          };
          if (this.shouldCache) {
            this.spots.push(event);
          } else {
            this.events.emit("spot", event);
          }
        }
        break;
    }
  }
}
