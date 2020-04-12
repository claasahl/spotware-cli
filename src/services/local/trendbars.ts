import * as B from "../base";

interface Bucket {
    begin: B.Timestamp;
    end: B.Timestamp;
}
function bucket(timestamp: B.Timestamp, period: B.Period): Bucket {
    const millisPerBucket = period;
    const bucketNo = Math.floor(timestamp / millisPerBucket);
    const begin = bucketNo * millisPerBucket;
    const end = begin + millisPerBucket;
    return { begin, end };
}

function accumulateTrendbar(
    prev: B.TrendbarEvent,
    curr: B.BidPriceChangedEvent,
    index: number
): B.TrendbarEvent {
    const next = { ...prev };
    if (index === 0) {
        next.open = curr.bid;
    }
    if (prev.high < curr.bid) {
        next.high = curr.bid;
    }
    if (prev.low > curr.bid) {
        next.low = curr.bid;
    }
    next.close = curr.bid;
    return next;
}

function toTrendbar(
    timestamp: B.Timestamp,
    events: B.BidPriceChangedEvent[]
): B.TrendbarEvent {
    const seed: B.TrendbarEvent = {
        open: 0,
        high: Number.MIN_VALUE,
        low: Number.MAX_VALUE,
        close: 0,
        timestamp,
        volume: 0
    };
    return events.reduce(accumulateTrendbar, seed);
}

export function trendbarsFromSpotPrices(props: B.TrendbarsProps & { spots: B.SpotPricesStream }): Promise<B.TrendbarsStream> {
    const stream = new B.DebugTrendbarsStream(props)
    const bucked = (timestamp: B.Timestamp): Bucket => bucket(timestamp, props.period);
    const values: B.BidPriceChangedEvent[] = [];
    props.spots.on("bid", e => {
        values.push(e);
        const bucket1 = bucked(values[0].timestamp);
        const bucket2 = bucked(values[values.length - 1].timestamp);
        if (bucket1.begin !== bucket2.begin) {
            const eventsInBucket = values.filter(
                e => bucked(e.timestamp).begin === bucket1.begin
            );
            values.splice(0, eventsInBucket.length);
            stream.emitTrendbar(toTrendbar(bucket1.begin, eventsInBucket))
        }
    });
    props.spots.on("ask", e => {
        if(values.length === 0) {
            return;
        }
        const bucket1 = bucked(values[0].timestamp);
        const bucket2 = bucked(e.timestamp);
        if (bucket1.begin !== bucket2.begin) {
            const eventsInBucket = values.filter(
                e => bucked(e.timestamp).begin === bucket1.begin
            );
            values.splice(0, eventsInBucket.length);
            stream.emitTrendbar(toTrendbar(bucket1.begin, eventsInBucket))
        }
    });
    return Promise.resolve(stream);
}