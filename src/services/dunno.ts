import { EventEmitter } from "events"

interface AskPriceChangedEvent {

}
interface BidPriceChangedEvent {

}
interface PriceChangedEvent {

}
enum Events {
    //
    askPriceChanged="askPriceChanged",
    bidPriceChanged="bidPriceChanged",
    priceChanged="priceChanged"   ,
    error="error"   ,

    // 

}

interface SymbolPriceService extends EventEmitter {
    addListener(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    addListener(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    addListener(event: Events.priceChanged, listener: (event: PriceChangedEvent) => void): this;
    addListener(event: Events.error, listener: (error: Error) => void): this;
    on(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    on(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    on(event: Events.priceChanged, listener: (event: PriceChangedEvent) => void): this;
    on(event: Events.error, listener: (error: Error) => void): this;
    once(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    once(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    once(event: Events.priceChanged, listener: (event: PriceChangedEvent) => void): this;
    once(event: Events.error, listener: (error: Error) => void): this;
    removeListener(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    removeListener(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    removeListener(event: Events.priceChanged, listener: (event: PriceChangedEvent) => void): this;
    removeListener(event: Events.error, listener: (error: Error) => void): this;
    off(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    off(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    off(event: Events.priceChanged   , listener: (event: PriceChangedEvent) => void   ): this;
    off(event: Events.error          , listener: (error: Error) => void               ): this;
    removeAllListeners(event?: Events): this;
    listeners(event: Events): Function[];
    rawListeners(event: Events): Function[];
    emit(event: Events.askPriceChanged, arg: AskPriceChangedEvent): boolean;
    emit(event: Events.bidPriceChanged, arg: BidPriceChangedEvent): boolean;
    emit(event: Events.priceChanged   , arg: PriceChangedEvent   ): boolean;
    emit(event: Events.error          , arg: Error               ): boolean;
    listenerCount(type: Events.askPriceChanged | Events.bidPriceChanged | Events.priceChanged | Events.error          ): number;
    prependListener(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    prependListener(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    prependListener(event: Events.priceChanged   , listener: (event: PriceChangedEvent   ) => void   ): this;
    prependListener(event: Events.error          , listener: (error: Error               ) => void               ): this;
    prependOnceListener(event: Events.askPriceChanged, listener: (event: AskPriceChangedEvent) => void): this;
    prependOnceListener(event: Events.bidPriceChanged, listener: (event: BidPriceChangedEvent) => void): this;
    prependOnceListener(event: Events.priceChanged   , listener: (event: PriceChangedEvent) => void   ): this;
    prependOnceListener(event: Events.error          , listener: (error: Error) => void               ): this;
}
const s: SymbolPriceService = new EventEmitter();
s.addListener(Events.askPriceChanged, () => {})

const services = {
    
}
const eventBus = new EventEmitter();

