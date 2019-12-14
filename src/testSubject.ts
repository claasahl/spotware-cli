import { SpotwareSubject } from "./spotwareSubject";
import { TlsOptions } from "tls";
import {
  applicationAuth,
  getAccountsByAccessToken,
  accountAuth,
  trader,
  symbolsList,
  symbolById,
  subscribeSpots,
  newOrder,
  cancelOrder,
  closePosition
} from "./requests";
import { concat, EMPTY, Observable, timer, combineLatest } from "rxjs";
import {
  flatMap,
  map,
  filter,
  first,
  mapTo,
  tap,
  pairwise,
  publishReplay,
  refCount,
  scan
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
  ProtoOATradeSide,
  ProtoOACancelOrderReq,
  ProtoOAClosePositionReq
} from "@claasahl/spotware-adapter";
import mem from "mem";

import { pm51 } from "./utils";

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

  private applicationAuth = mem(
    (
      payload: Omit<ProtoOAApplicationAuthReq, "clientId" | "clientSecret">
    ): Observable<ProtoOAApplicationAuthRes> => {
      return applicationAuth(this, {
        ...payload,
        clientId: this.authOptions.clientId,
        clientSecret: this.authOptions.clientSecret
      }).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private accountAuth = mem(
    (
      payload: Omit<ProtoOAAccountAuthReq, "accessToken">
    ): Observable<ProtoOAAccountAuthRes> => {
      return accountAuth(this, {
        ...payload,
        accessToken: this.authOptions.accessToken
      }).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private getAccountsByAccessToken = mem(
    (
      payload: Omit<ProtoOAGetAccountListByAccessTokenReq, "accessToken">
    ): Observable<ProtoOAGetAccountListByAccessTokenRes> => {
      return getAccountsByAccessToken(this, {
        ...payload,
        accessToken: this.authOptions.accessToken
      }).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private trader = mem(
    (payload: ProtoOATraderReq): Observable<ProtoOATraderRes> => {
      return trader(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolsList = mem(
    (payload: ProtoOASymbolsListReq): Observable<ProtoOASymbolsListRes> => {
      return symbolsList(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private symbolById = mem(
    (payload: ProtoOASymbolByIdReq): Observable<ProtoOASymbolByIdRes> => {
      return symbolById(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private subscribeSpots = mem(
    (
      payload: ProtoOASubscribeSpotsReq
    ): Observable<ProtoOASubscribeSpotsRes> => {
      return subscribeSpots(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload)
      );
    },
    { cacheKey }
  );
  private newOrder = mem(
    (payload: ProtoOANewOrderReq): Observable<void> => {
      return newOrder(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload),
        mapTo(undefined)
      );
    },
    { cacheKey }
  );
  private cancelOrder = mem(
    (payload: ProtoOACancelOrderReq): Observable<void> => {
      return cancelOrder(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload),
        mapTo(undefined)
      );
    },
    { cacheKey }
  );
  private closePosition = mem(
    (payload: ProtoOAClosePositionReq): Observable<void> => {
      return closePosition(this, payload).pipe(
        publishReplay(1, 10000),
        refCount(),
        map(pm => pm.payload),
        mapTo(undefined)
      );
    },
    { cacheKey }
  );

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

  public symbol(
    symbol: string
  ): Observable<ProtoOASymbol & { ctidTraderAccountId: number }> {
    // TODO: this should be grouped
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        const lookupSymbolId = this.symbolsList({ ctidTraderAccountId }).pipe(
          map(res =>
            res.symbol.filter(({ symbolName }) => symbol === symbolName)
          ),
          map(symbols => symbols.map(symbol => symbol.symbolId))
        );

        const lookupSymbol = lookupSymbolId.pipe(
          flatMap(symbolId =>
            this.symbolById({ ctidTraderAccountId, symbolId })
          ),
          flatMap(res => res.symbol),
          map(a => ({ ...a, ctidTraderAccountId })),
          first()
        );
        return lookupSymbol;
      })
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
            return spot;
          }),
          filter((spot): spot is Spot => !!(spot.ask && spot.bid))
        );

        return subscribeToSymbol.pipe(flatMap(() => spotsForSymbol));
      })
    );
  }

  public heartbeats(): Observable<void> {
    return timer(10000, 10000).pipe(
      mapTo(pm51({})),
      tap(this),
      mapTo(undefined)
    );
  }

  public marketOrder(
    symbol: string,
    volume: number,
    tradeSide: ProtoOATradeSide
  ): Observable<void> {
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.newOrder({
          comment: "comment",
          label: "label",
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          symbolId: symbol.symbolId,
          orderType: ProtoOAOrderType.MARKET,
          tradeSide,
          volume: volume * (symbol.lotSize || 1)
        });
      })
    );
  }

  public limitOrder(
    symbol: string,
    volume: number,
    tradeSide: ProtoOATradeSide,
    limitPrice: number
  ): Observable<void> {
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.newOrder({
          comment: "comment",
          label: "label",
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          symbolId: symbol.symbolId,
          orderType: ProtoOAOrderType.LIMIT,
          tradeSide,
          volume: volume * (symbol.lotSize || 1),
          limitPrice
        });
      })
    );
  }

  public cancelOrderr(orderId: number): Observable<void> {
    return this.accounts().pipe(
      flatMap(({ ctidTraderAccountId }) => {
        return this.cancelOrder({ ctidTraderAccountId, orderId });
      })
    );
  }

  public closePositionn(
    positionId: number,
    symbol: string,
    volume: number
  ): Observable<void> {
    // TODO get symbol from position
    // TODO close entire position if no volume specified
    return this.symbol(symbol).pipe(
      flatMap(symbol => {
        return this.closePosition({
          ctidTraderAccountId: symbol.ctidTraderAccountId,
          positionId,
          volume: volume * (symbol.lotSize || 1)
        });
      })
    );
  }

  public ordersAndPositions(): Observable<any> {
    return this.pipe(
      filter(
        (pm): pm is ProtoMessage2126 =>
          pm.payloadType === ProtoOAPayloadType.PROTO_OA_EXECUTION_EVENT
      ),
      map(res => res.payload),
      scan(
        (acc, event) => {
          const positions: any = { ...acc.positions };
          if (event.position) {
            positions[event.position.positionId] = event.position;
          }
          const orders: any = { ...acc.orders };
          if (event.order) {
            orders[event.order.orderId] = event.order;
          }
          return { positions, orders };
        },
        { positions: {}, orders: {} }
      ),
      tap(console.log)
    );
  }
}
export default TestSubject;
