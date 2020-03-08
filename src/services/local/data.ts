import { AskPriceChangedEvent, BidPriceChangedEvent, PriceChangedEvent } from "../spotPrices";

export async function* sampleData(): AsyncGenerator<
  AskPriceChangedEvent | BidPriceChangedEvent | PriceChangedEvent,
  void,
  unknown
> {
  yield { ask: 6611.79, timestamp: 1577663999771 };
  yield { bid: 6612.03, timestamp: 1577663999425 };
  yield { bid: 6612.28, timestamp: 1577663999110 };
  yield { ask: 6612.52, timestamp: 1577663998928 };
  yield { bid: 6612.73, timestamp: 1577663998447 };
  yield { bid: 6613.18, timestamp: 1577663998021 };
  yield { ask: 6613.21, timestamp: 1577663997680 };
  yield { bid: 6613.11, timestamp: 1577663997264 };
  yield { bid: 6613.18, timestamp: 1577663997026 };
  yield { bid: 6613.21, timestamp: 1577663996609 };
  yield { ask: 6613.24, timestamp: 1577663995996 };
  yield { bid: 6613.98, timestamp: 1577663995829 };
  yield { bid: 6614.08, timestamp: 1577663995601 };
  yield { ask: 6613, bid: 6613.91, timestamp: 1577663995198 };
  yield { ask: 6613, bid: 6613.17, timestamp: 1577663994564 };
  yield { ask: 6613, bid: 6613.14, timestamp: 1577663994182 };
  yield { bid: 6613.21, timestamp: 1577663993987 };
  yield { ask: 6612.72, timestamp: 1577663993516 };
}
