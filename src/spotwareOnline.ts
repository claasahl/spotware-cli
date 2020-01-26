import { Observable, EMPTY, concat, identity } from "rxjs";
import debug from "debug";
import { TlsOptions } from "tls";

import { Spot, Trader, Order, Position } from "./types";
import TestSubject from "./testSubject";
import { map, mapTo, flatMap, publish, refCount, filter } from "rxjs/operators";
import {
  ProtoOATradeSide,
  ProtoMessage2126,
  ProtoOAPayloadType,
  ProtoOAPosition
} from "@claasahl/spotware-adapter";
import { BaseTrader } from "./baseTrader";

interface AuthenticationOptions {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
interface ConnectionOptions {
  port: number;
  host: string;
  options?: TlsOptions;
}

export class SpotwareOnline extends BaseTrader implements Trader {
  private log = debug("spotware-online");
  private subject: TestSubject;
  private symbol: string;
  private auth: Observable<never>;

  constructor({
    auth,
    conn,
    symbol
  }: {
    auth: AuthenticationOptions;
    conn: ConnectionOptions;
    symbol: string;
  }) {
    super();
    this.log("options: %j", { auth, conn, symbol });
    this.subject = new TestSubject(auth, conn);
    this.symbol = symbol;
    this.auth = this.subject
      .authenticate()
      .pipe(mapTo(EMPTY), flatMap(identity), publish(), refCount());
    this.subject.heartbeats().subscribe();
  }

  spots(): Observable<Spot> {
    const liveSpots = this.subject
      .spots(this.symbol)
      .pipe(map(spot => ({ ...spot, timestamp: spot.date.getTime() })));
    return concat(this.auth, liveSpots);
  }

  orders(): Observable<Order> {
    return EMPTY;
  }

  positions(): Observable<Position> {
    return this.subject.pipe(
      filter(
        (pm): pm is ProtoMessage2126 =>
          pm.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT
      ),
      // TODO filter symbolId
      map(res => res.payload.position),
      filter((position): position is ProtoOAPosition => !!position),
      map(
        ({
          positionId,
          stopLoss,
          takeProfit,
          price = 0,
          tradeData: { volume }
        }) => {
          return {
            id: `${positionId}`,
            status: "CLOSED",
            tradeSide: "BUY",
            price,
            volume,
            stopLoss,
            takeProfit
          };
        }
      )
    );
  }

  stopOrder({
    price,
    volume,
    tradeSide,
    expirationTimestamp,
    stopLoss,
    takeProfit,
    trailingStopLoss
  }: Omit<Order, "id">): Observable<Order> {
    return concat(
      this.auth,
      this.subject.stopOrder(this.symbol, {
        stopPrice: price,
        volume,
        tradeSide: (() => {
          switch (tradeSide) {
            case "BUY":
              return ProtoOATradeSide.BUY;
            case "SELL":
              return ProtoOATradeSide.SELL;
          }
        })(),
        expirationTimestamp,
        stopLoss,
        takeProfit,
        trailingStopLoss
      })
    ).pipe(flatMap(() => EMPTY));
  }
  limitOrder({
    price,
    volume,
    tradeSide,
    expirationTimestamp,
    stopLoss,
    takeProfit,
    trailingStopLoss
  }: Omit<Order, "id">): Observable<Order> {
    return concat(
      this.auth,
      this.subject.limitOrder(this.symbol, {
        limitPrice: price,
        volume,
        tradeSide: (() => {
          switch (tradeSide) {
            case "BUY":
              return ProtoOATradeSide.BUY;
            case "SELL":
              return ProtoOATradeSide.SELL;
          }
        })(),
        expirationTimestamp,
        stopLoss,
        takeProfit,
        trailingStopLoss
      })
    ).pipe(flatMap(() => EMPTY));
  }
}
