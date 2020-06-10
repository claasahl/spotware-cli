import { Price, Timestamp, Currency, GenericReadable } from "./types";
import { OrderStream, MarketOrderProps, StopOrderProps, OrderEvent, OrderProps } from "./order";
import { SpotPricesStream, SpotPricesProps } from "./spotPrices";
import { TrendbarsProps, TrendbarsStream } from "./trendbars";

export interface BalanceChangedEvent {
  type: "BALANCE_CHANGED";
  balance: Price;
  timestamp: Timestamp;
}
export interface TransactionEvent {
  type: "TRANSACTION";
  amount: Price;
  timestamp: Timestamp;
}
export interface EquityChangedEvent {
  type: "EQUITY_CHANGED";
  equity: Price;
  timestamp: Timestamp;
}
export type OrderEvents = OrderEvent & OrderProps; // TODO revise/remove this
export type AccountSimpleMarketOrderProps = Omit<MarketOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleStopOrderProps = Omit<StopOrderProps, keyof AccountProps | "orderType">;
export type AccountSimpleSpotPricesProps = Omit<SpotPricesProps, keyof AccountProps>;
export type AccountSimpleTrendbarsProps = Omit<TrendbarsProps, keyof AccountProps>;
export type AccountEvent = BalanceChangedEvent | TransactionEvent | EquityChangedEvent | OrderEvents;

export interface AccountProps {
  readonly currency: Currency;
}
export interface AccountActions {
  marketOrder(props: AccountSimpleMarketOrderProps): OrderStream<MarketOrderProps>;
  stopOrder(props: AccountSimpleStopOrderProps): OrderStream<StopOrderProps>;
  spotPrices(props: AccountSimpleSpotPricesProps): SpotPricesStream;
  trendbars(props: AccountSimpleTrendbarsProps): TrendbarsStream;
}
export interface AccountStream extends GenericReadable<AccountEvent>, AccountActions {
  readonly props: AccountProps;
}
