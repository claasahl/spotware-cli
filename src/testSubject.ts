import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import fs from "fs";
import {
  applicationAuth as applicationAuthReq,
  getAccountsByAccessToken as getAccountsByAccessTokenReq,
  getCtidProfileByToken as getCtidProfileByTokenReq,
  accountAuth as accountAuthReq,
  trader as traderReq,
  symbolsList as symbolsListReq,
  assetClassList as assetClassListReq,
  assetList as assetListReq,
  dealList as dealListReq,
  symbolById as symbolByIdReq,
  subscribeSpots as subscribeSpotsReq,
  newOrder as newOrderReq,
  cancelOrder as cancelOrderReq,
  closePosition as closePositionReq,
  amendPositionSltp as amendPositionSltpReq,
  amendOrder as amendOrderReq,
  version as versionReq
} from "./requests";
import {
  concat,
  EMPTY,
  Observable,
  timer,
  combineLatest,
  pipe,
  OperatorFunction,
  from
} from "rxjs";
import {
  flatMap,
  map,
  filter,
  mapTo,
  tap,
  pairwise,
  publishReplay,
  refCount,
  scan,
  takeUntil,
  endWith,
  take,
  withLatestFrom,
  reduce,
  skipUntil
} from "rxjs/operators";
import {
  ProtoOATrader,
  ProtoOASymbol,
  ProtoMessage2131,
  ProtoOAPayloadType,
  ProtoOAGetAccountListByAccessTokenRes,
  ProtoOATraderRes,
  ProtoOASymbolsListRes,
  ProtoOASymbolByIdRes,
  ProtoOATraderReq,
  ProtoOASymbolByIdReq,
  ProtoOASymbolsListReq,
  ProtoOAGetAccountListByAccessTokenReq,
  ProtoOAApplicationAuthReq,
  ProtoOAApplicationAuthRes,
  ProtoOAAccountAuthReq,
  ProtoOAAccountAuthRes,
  ProtoOASubscribeSpotsReq,
  ProtoOASubscribeSpotsRes,
  ProtoMessage2126,
  ProtoOANewOrderReq,
  ProtoOAOrderType,
  ProtoOACancelOrderReq,
  ProtoOAClosePositionReq,
  ProtoOAAmendPositionSLTPReq,
  ProtoOAAmendOrderReq,
  ProtoOAAssetClassListReq,
  ProtoOAAssetClassListRes,
  ProtoOAAssetListReq,
  ProtoOAAssetListRes,
  ProtoOAAssetClass,
  ProtoOAAsset,
  ProtoOALightSymbol,
  ProtoOAGetCtidProfileByTokenReq,
  ProtoOAGetCtidProfileByTokenRes,
  ProtoOACtidProfile,
  ProtoOAVersionReq,
  ProtoOAVersionRes,
  ProtoOADealListReq,
  ProtoOADealListRes,
  ProtoOADeal,
  ProtoOAOrder,
  ProtoOAPosition,
  ProtoOAOrderStatus,
  ProtoOAPositionStatus,
  ProtoOATrendbarPeriod
} from "@claasahl/spotware-adapter";
import mem from "mem";

import { pm51, periodToMillis, price as readablePrice } from "./utils";
import { Trendbar } from "./types";

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

interface Spot {
  ask: number;
  bid: number;
  spread: number;
  symbolId: number;
  ctidTraderAccountId: number;
  date: Date;
}

const cacheKey = (arguments_: any) => JSON.stringify(arguments_);
export class TestSubject extends SpotwareSubject {
  private authOptions: AuthenticationOptions;

  constructor(
    authOptions: AuthenticationOptions,
    connOptions: ConnectionOptions
  ) {
    super(connOptions.port, connOptions.host, connOptions.options);
    this.authOptions = { ...authOptions };
  }

  private applicationAuth(
    payload: Omit<ProtoOAApplicationAuthReq, "clientId" | "clientSecret">
  ): Observable<ProtoOAApplicationAuthRes> {
    return applicationAuthReq(this, {
      ...payload,
      clientId: this.authOptions.clientId,
      clientSecret: this.authOptions.clientSecret
    }).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload)
    );
  }
  private accountAuth(
    payload: Omit<ProtoOAAccountAuthReq, "accessToken">
  ): Observable<ProtoOAAccountAuthRes> {
    return accountAuthReq(this, {
      ...payload,
      accessToken: this.authOptions.accessToken
    }).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload)
    );
  }
  private getAccountsByAccessToken = mem(
    (
      payload: Omit<ProtoOAGetAccountListByAccessTokenReq, "accessToken">
    ): Observable<ProtoOAGetAccountListByAccessTokenRes> => {
      return getAccountsByAccessTokenReq(this, {
        ...payload,
        accessToken: this.authOptions.accessToken
      }).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private getCtidProfileByToken = mem(
    (
      payload: Omit<ProtoOAGetCtidProfileByTokenReq, "accessToken">
    ): Observable<ProtoOAGetCtidProfileByTokenRes> => {
      return getCtidProfileByTokenReq(this, {
        ...payload,
        accessToken: this.authOptions.accessToken
      }).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private version = mem(
    (payload: ProtoOAVersionReq): Observable<ProtoOAVersionRes> => {
      return versionReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private trader = mem(
    (payload: ProtoOATraderReq): Observable<ProtoOATraderRes> => {
      return traderReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private dealList = mem(
    (payload: ProtoOADealListReq): Observable<ProtoOADealListRes> => {
      return dealListReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private assetClassList = mem(
    (
      payload: ProtoOAAssetClassListReq
    ): Observable<ProtoOAAssetClassListRes> => {
      return assetClassListReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private assetList = mem(
    (payload: ProtoOAAssetListReq): Observable<ProtoOAAssetListRes> => {
      return assetListReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolsList = mem(
    (payload: ProtoOASymbolsListReq): Observable<ProtoOASymbolsListRes> => {
      return symbolsListReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolById = mem(
    (payload: ProtoOASymbolByIdReq): Observable<ProtoOASymbolByIdRes> => {
      return symbolByIdReq(this, payload).pipe(
        publishReplay(1),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private subscribeSpots = mem(
    (
      payload: ProtoOASubscribeSpotsReq
    ): Observable<ProtoOASubscribeSpotsRes> => {
      return subscribeSpotsReq(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        take(1),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private newOrder(payload: ProtoOANewOrderReq): Observable<void> {
    return newOrderReq(this, payload).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload),
      mapTo(undefined)
    );
  }
  private cancelOrder(payload: ProtoOACancelOrderReq): Observable<void> {
    return cancelOrderReq(this, payload).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload),
      mapTo(undefined)
    );
  }
  private closePosition(payload: ProtoOAClosePositionReq): Observable<void> {
    return closePositionReq(this, payload).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload),
      mapTo(undefined)
    );
  }
  private amendOrder(payload: ProtoOAAmendOrderReq): Observable<void> {
    return amendOrderReq(this, payload).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload),
      mapTo(undefined)
    );
  }
  private amendPositionSltp(
    payload: ProtoOAAmendPositionSLTPReq
  ): Observable<void> {
    return amendPositionSltpReq(this, payload).pipe(
      publishReplay(1, 10000),
      refCount(),
      take(1),
      map(pm => pm.payload),
      mapTo(undefined)
    );
  }

  public authenticate(): Observable<void> {
    const authApplication = this.applicationAuth({});
    const authAccounts = this.getAccountsByAccessToken({}).pipe(
      flatMap(res => res.ctidTraderAccount),
      flatMap(({ ctidTraderAccountId }) =>
        this.accountAuth({ ctidTraderAccountId })
      )
    );
    return concat(authApplication, authAccounts).pipe(flatMap(() => EMPTY));
  }

  public accounts(): Observable<ProtoOATrader> {
    return this.getAccountsByAccessToken({}).pipe(
      flatMap(res => res.ctidTraderAccount),
      flatMap(({ ctidTraderAccountId }) =>
        this.trader({ ctidTraderAccountId })
      ),
      map(pm => pm.trader)
    );
  }

  public profile(): Observable<ProtoOACtidProfile> {
    return this.getCtidProfileByToken({}).pipe(map(res => res.profile));
  }

  public protocolVersion(): Observable<string> {
    return this.version({}).pipe(map(res => res.version));
  }

  public assetClasses(): Observable<
    ProtoOAAssetClass & { ctidTraderAccountId: number }
  > {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) =>
        this.assetClassList({ ctidTraderAccountId })
      ),
      flatMap(res =>
        res.assetClass.map(assetClass => ({
          ...assetClass,
          ctidTraderAccountId: res.ctidTraderAccountId
        }))
      )
    );
  }

  public assetClass(
    name: string
  ): Observable<ProtoOAAssetClass & { ctidTraderAccountId: number }> {
    return this.assetClasses().pipe(
      filter(assetClass => assetClass.name === name)
    );
  }

  public assets(): Observable<ProtoOAAsset & { ctidTraderAccountId: number }> {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) =>
        this.assetList({ ctidTraderAccountId })
      ),
      flatMap(res =>
        res.asset.map(asset => ({
          ...asset,
          ctidTraderAccountId: res.ctidTraderAccountId
        }))
      )
    );
  }

  public asset(
    name: string
  ): Observable<ProtoOAAsset & { ctidTraderAccountId: number }> {
    return this.assets().pipe(filter(asset => asset.name === name));
  }

  public symbols(): Observable<
    ProtoOALightSymbol & { ctidTraderAccountId: number }
  > {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) =>
        this.symbolsList({ ctidTraderAccountId })
      ),
      flatMap(res =>
        res.symbol.map(symbol => ({
          ...symbol,
          ctidTraderAccountId: res.ctidTraderAccountId
        }))
      )
    );
  }

  public symbol(
    name: string
  ): Observable<ProtoOASymbol & { ctidTraderAccountId: number }> {
    return this.symbols().pipe(
      filter(symbol => symbol.symbolName === name),
      flatMap(symbol =>
        this.symbolById({
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          symbolId: [symbol.symbolId]
        })
      ),
      flatMap(res =>
        res.symbol.map(symbol => ({
          ...symbol,
          ctidTraderAccountId: res.ctidTraderAccountId
        }))
      )
    );
  }

  public spots(symbol: string): Observable<Spot> {
    // TODO: this should be grouped
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        const symbolId = this.symbol(symbol).pipe(
          map(({ symbolId }) => symbolId)
        );
        const subscribeToSymbol = this.symbol(symbol).pipe(
          flatMap(({ symbolId }) =>
            this.subscribeSpots({ ctidTraderAccountId, symbolId: [symbolId] })
          )
        );

        const spotEvents = this.pipe(
          filter(
            (pm): pm is ProtoMessage2131 =>
              pm.payloadType === ProtoOAPayloadType.PROTO_OA_SPOT_EVENT
          ),
          map(pm => pm.payload)
        );
        const spotEventForSymbol = combineLatest(spotEvents, symbolId).pipe(
          filter(([event, symbolId]) => event.symbolId === symbolId),
          filter(
            ([event, _symbolId]) =>
              event.ctidTraderAccountId === ctidTraderAccountId
          ),
          map(([event, _symbolId]) => event)
        );

        const spotsForSymbol = spotEventForSymbol.pipe(
          filter(event => !!(event.ask || event.bid)),
          map(({ ask, bid, ctidTraderAccountId, symbolId }) => ({
            ask,
            bid,
            spread: 0,
            symbolId,
            ctidTraderAccountId,
            date: new Date()
          })),
          pairwise(),
          map(([left, right]) => {
            const spot = { ...right };
            if (!spot.ask) {
              spot.ask = left.ask;
            }
            if (!spot.bid) {
              spot.bid = left.bid;
            }
            if (spot.bid && spot.ask) {
              spot.spread = spot.ask - spot.bid;
            }
            return spot;
          }),
          filter((spot): spot is Spot => !!(spot.ask && spot.bid)),
          map(spot => ({
            ...spot,
            ask: readablePrice(spot.symbolId, spot.ask),
            bid: readablePrice(spot.symbolId, spot.bid),
            spread: readablePrice(spot.symbolId, spot.spread)
          }))
        );

        return subscribeToSymbol.pipe(flatMap(() => spotsForSymbol));
      })
    );
  }

  public trendbars(
    symbol: string,
    period: ProtoOATrendbarPeriod
  ): Observable<Trendbar> {
    return this.spots(symbol).pipe(
      map(spot => ({ ...spot, periodStart: periodStart(spot.date, period) })),
      scan(
        (acc, curr) => {
          const price = curr.bid;
          if (acc.date.getTime() === curr.periodStart.getTime()) {
            const trendbar = { ...acc };
            trendbar.close = price;
            if (trendbar.high < price) {
              trendbar.high = price;
            }
            if (trendbar.low > price) {
              trendbar.low = price;
            }
            return trendbar;
          } else {
            return {
              date: curr.periodStart,
              timestamp: curr.periodStart.getTime(),
              open: price,
              high: price,
              low: price,
              close: price,
              symbolId: curr.symbolId,
              ctidTraderAccountId: curr.ctidTraderAccountId,
              volume: 0,
              period
            };
          }
        },
        {
          date: new Date(0),
          timestamp: 0,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          symbolId: 0,
          ctidTraderAccountId: 0,
          volume: 0,
          period
        }
      ),
      pairwise(),
      filter(([left, right]) => left.timestamp !== right.timestamp),
      map(([left, _right]) => left)
    );
  }

  public slidingTrendbars(
    symbol: string,
    period: ProtoOATrendbarPeriod
  ): Observable<Trendbar[]> {
    const millis = periodToMillis(period);
    const timeframe = millis * 2;
    function withinTimeframe(spot: Spot) {
      const lowerBound = Date.now() - timeframe;
      const timestamp = spot.date.getTime();
      return timestamp >= lowerBound;
    }
    function withinBucket1(spot: Spot) {
      const lowerBound = Date.now() - millis * 2;
      const upperBound = Date.now() - millis * 1;
      const timestamp = spot.date.getTime();
      return timestamp >= lowerBound && timestamp < upperBound;
    }
    function withinBucket2(spot: Spot) {
      const lowerBound = Date.now() - millis;
      const timestamp = spot.date.getTime();
      return timestamp >= lowerBound;
    }
    function spotToTrendbar(): OperatorFunction<Spot, Trendbar> {
      return pipe(
        reduce(
          (acc, curr) => {
            const price = curr.bid;
            if (acc.timestamp) {
              const trendbar = { ...acc };
              trendbar.close = price;
              if (trendbar.high < price) {
                trendbar.high = price;
              }
              if (trendbar.low > price) {
                trendbar.low = price;
              }
              return trendbar;
            } else {
              return {
                date: curr.date,
                timestamp: curr.date.getTime(),
                open: price,
                high: price,
                low: price,
                close: price,
                symbolId: curr.symbolId,
                ctidTraderAccountId: curr.ctidTraderAccountId,
                volume: 0,
                period
              };
            }
          },
          {
            date: new Date(0),
            timestamp: 0,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
            symbolId: 0,
            ctidTraderAccountId: 0,
            volume: 0,
            period
          }
        )
      );
    }
    const spots = this.spots(symbol).pipe(
      scan((acc, curr) => [...acc, curr].filter(withinTimeframe), [] as Spot[])
    );
    const bucket1 = spots.pipe(
      map(spots => spots.filter(withinBucket1)),
      flatMap(spots => from(spots).pipe(spotToTrendbar()))
    );
    const bucket2 = spots.pipe(
      map(spots => spots.filter(withinBucket2)),
      flatMap(spots => from(spots).pipe(spotToTrendbar()))
    );
    return bucket1.pipe(withLatestFrom(bucket2), skipUntil(timer(timeframe)));
  }

  public heartbeats(): Observable<void> {
    const subjectCompleted = this.pipe(
      flatMap(() => EMPTY),
      endWith("completed")
    );
    return timer(10000, 10000).pipe(
      takeUntil(subjectCompleted),
      mapTo(pm51({})),
      tap(this),
      mapTo(undefined)
    );
  }

  public marketOrder(
    symbol: string,
    payload: Omit<
      ProtoOANewOrderReq,
      | "payloadType"
      | "ctidTraderAccountId"
      | "symbolId"
      | "orderType"
      | "stopPrice"
      | "limitPrice"
    >
  ): Observable<void> {
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.newOrder({
          ...payload,
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          symbolId: symbol.symbolId,
          orderType: ProtoOAOrderType.MARKET,
          volume: payload.volume * (symbol.lotSize || 1)
        });
      })
    );
  }

  public limitOrder(
    symbol: string,
    payload: Omit<
      ProtoOANewOrderReq,
      | "payloadType"
      | "ctidTraderAccountId"
      | "symbolId"
      | "orderType"
      | "stopPrice"
    >
  ): Observable<void> {
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.newOrder({
          ...payload,
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          volume: payload.volume * (symbol.lotSize || 1),
          symbolId: symbol.symbolId,
          orderType: ProtoOAOrderType.LIMIT
        });
      })
    );
  }

  public stopOrder(
    symbol: string,
    payload: Omit<
      ProtoOANewOrderReq,
      | "payloadType"
      | "ctidTraderAccountId"
      | "symbolId"
      | "orderType"
      | "limitPrice"
    >
  ): Observable<void> {
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.newOrder({
          ...payload,
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          volume: payload.volume * (symbol.lotSize || 1),
          symbolId: symbol.symbolId,
          orderType: ProtoOAOrderType.STOP
        });
      })
    );
  }

  public cancelOrderr(
    payload: Omit<ProtoOACancelOrderReq, "payloadType" | "ctidTraderAccountId">
  ): Observable<void> {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        return this.cancelOrder({ ...payload, ctidTraderAccountId });
      })
    );
  }

  public closePositionn(
    symbol: string,
    payload: Omit<
      ProtoOAClosePositionReq,
      "payloadType" | "ctidTraderAccountId"
    >
  ): Observable<void> {
    // TODO get symbol from position
    // TODO close entire position if no volume specified
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.closePosition({
          ...payload,
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          volume: payload.volume * (symbol.lotSize || 1)
        });
      })
    );
  }
  public amendOrderr(
    symbol: string,
    payload: Omit<ProtoOAAmendOrderReq, "payloadType" | "ctidTraderAccountId">
  ): Observable<void> {
    // TODO get symbol from position
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.amendOrder({
          ...payload,
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          volume: payload.volume
            ? payload.volume * (symbol.lotSize || 1)
            : undefined
        });
      })
    );
  }
  public amendPositionSltpp(
    payload: Omit<
      ProtoOAAmendPositionSLTPReq,
      "payloadType" | "ctidTraderAccountId"
    >
  ): Observable<void> {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        return this.amendPositionSltp({
          ...payload,
          ctidTraderAccountId
        });
      })
    );
  }

  public deals(
    from: Date,
    to: Date
  ): Observable<ProtoOADeal & { ctidTraderAccountId: number }> {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) =>
        this.dealList({
          ctidTraderAccountId,
          fromTimestamp: from.getTime(),
          toTimestamp: to.getTime()
        })
      ),
      flatMap(res =>
        res.deal.map(deal => ({
          ...deal,
          ctidTraderAccountId: res.ctidTraderAccountId
        }))
      )
    );
  }

  public ordersAndPositions(): Observable<PositionsOrdersAndDeals> {
    const seed: PositionsOrdersAndDeals = {
      positions: {},
      orders: {},
      deals: {}
    };
    return this.pipe(
      filter(
        (pm): pm is ProtoMessage2126 =>
          pm.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT
      ),
      map(res => res.payload),
      scan((acc, event) => {
        const positions = { ...acc.positions };
        if (event.position) {
          positions[event.position.positionId] = event.position;
        }
        const orders = { ...acc.orders };
        if (event.order) {
          orders[event.order.orderId] = event.order;
        }
        const deals = { ...acc.deals };
        if (event.deal) {
          deals[event.deal.dealId] = event.deal;
        }
        return { positions, orders, deals };
      }, seed),
      tap(data => {
        eventCounter++;
        const now = new Date();
        const filename = `./store/${now
          .toISOString()
          .replace(/:/g, "-")
          .replace(".", "-")}-${eventCounter}.json`;
        fs.writeFile(filename, JSON.stringify(data, null, 2), () => {});
      })
    );
  }

  public openOrdersAndPositions(
    label?: string
  ): Observable<PositionsOrdersAndDeals> {
    return this.ordersAndPositions().pipe(
      map(data => {
        const positions = { ...data.positions };
        Object.entries(positions).forEach(([_key, position]) => {
          const labelMatched = label
            ? position.tradeData.label === label
            : true;
          if (
            position.positionStatus ===
              ProtoOAPositionStatus.POSITION_STATUS_OPEN &&
            labelMatched
          ) {
            // aka "open" position
          } else {
            delete positions[position.positionId];
          }
        });

        const orders = { ...data.orders };
        Object.entries(orders).forEach(([_key, order]) => {
          const labelMatched = label ? order.tradeData.label === label : true;
          if (
            order.orderStatus === ProtoOAOrderStatus.ORDER_STATUS_ACCEPTED &&
            labelMatched &&
            !order.closingOrder
          ) {
            // aka "open" order
          } else {
            delete orders[order.orderId];
          }
        });
        return {
          positions,
          orders,
          deals: {}
        };
      }),
      tap(data => {
        const now = new Date();
        const filename = `./store/${now
          .toISOString()
          .replace(/:/g, "-")
          .replace(".", "-")}-${eventCounter}-open.json`;
        fs.writeFile(filename, JSON.stringify(data, null, 2), () => {});
      })
    );
  }
}
export default TestSubject;

let eventCounter = 0;
interface PositionsOrdersAndDeals {
  positions: {
    [dealId: number]: ProtoOAPosition;
  };
  orders: {
    [dealId: number]: ProtoOAOrder;
  };
  deals: {
    [dealId: number]: ProtoOADeal;
  };
}

function periodStart(date: Date, period: ProtoOATrendbarPeriod): Date {
  const timestamp = date.getTime();
  const millis = periodToMillis(period);
  const periodStart = Math.floor(timestamp / millis) * millis;
  return new Date(periodStart);
}
