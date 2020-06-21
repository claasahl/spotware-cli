import { Symbol, Timestamp, TradeSide, Volume, Price, OrderType, GenericReadable } from "./types";

export interface OrderCreatedEvent {
  type: "CREATED";
  timestamp: Timestamp;
}
export interface OrderAcceptedEvent {
  type: "ACCEPTED";
  timestamp: Timestamp;
}
export interface OrderRejectedEvent {
  type: "REJECTED";
  timestamp: Timestamp;
  message?: string;
}
export interface OrderCanceledEvent {
  type: "CANCELED";
  timestamp: Timestamp;
}
export interface OrderExpiredEvent {
  type: "EXPIRED";
  timestamp: Timestamp;
}
export interface OrderFilledEvent {
  type: "FILLED";
  timestamp: Timestamp;
  entry: Price;
}
export interface OrderProfitLossEvent {
  type: "PROFITLOSS";
  timestamp: Timestamp;
  price: Price;
  profitLoss: Price;
}
export interface OrderClosedEvent {
  type: "CLOSED";
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
}
export type OrderEndedEvent = {
  type: "ENDED";
  timestamp: Timestamp;
  exit: Price;
  profitLoss: Price;
} | {
  type: "ENDED";
  timestamp: Timestamp;
}
export type OrderEvent = OrderCreatedEvent | OrderAcceptedEvent | OrderRejectedEvent | OrderExpiredEvent | OrderCanceledEvent | OrderFilledEvent | OrderProfitLossEvent | OrderClosedEvent | OrderEndedEvent;

interface CommonOrderProps {
  readonly id: string;
  readonly symbol: Symbol;
  readonly tradeSide: TradeSide;
  readonly volume: Volume;
  readonly takeProfit?: Price;
  readonly stopLoss?: Price;
  readonly orderType: OrderType
  readonly expiresAt?: Timestamp
}

export interface MarketOrderProps extends CommonOrderProps {
  readonly orderType: "MARKET"
}
export interface StopOrderProps extends CommonOrderProps {
  readonly orderType: "STOP"
  readonly enter: Price;
}
export type OrderProps = MarketOrderProps | StopOrderProps

export interface OrderActions {
  closeOrder(): void;
  cancelOrder(): void;
  endOrder(): void;
}

export interface OrderStream<Props extends OrderProps> extends GenericReadable<OrderEvent>, OrderActions {
  readonly props: Props
}

export function lifecycle() {
  class ABV {
    state?: OrderEvent["type"];

    test(event: Pick<OrderEvent, "type">): boolean {
      switch (event.type) {
        case "ACCEPTED":
          return this.state === "CREATED"
        case "CANCELED":
          return this.state === "CREATED" || this.state === "ACCEPTED" || this.state === "CANCELED"
        case "CLOSED":
          return this.state === "FILLED" || this.state === "CLOSED"
        case "CREATED":
          return this.state === undefined
        case "ENDED":
          return this.state === "REJECTED" || this.state === "CLOSED" || this.state === "CANCELED" || this.state === "EXPIRED"
        case "EXPIRED":
          return this.state === "ACCEPTED" || this.state === "EXPIRED"
        case "FILLED":
          return this.state === "ACCEPTED" || this.state === "FILLED"
        case "PROFITLOSS":
          return this.state === "FILLED"
        case "REJECTED":
          return this.state === "CREATED" || this.state === "REJECTED"
      }
    }

    update(event: OrderEvent): OrderEvent["type"] | undefined {
      if(this.test(event)) {
        if(event.type === "ENDED") {
          return this.state;
        } else if(event.type === "PROFITLOSS") {
          return this.state;
        } else {
          this.state = event.type;
          return this.state;
        }
      }
      return this.state;
    }
  }
  return new ABV();
}
