export function structurePoints() {
  const init = { reference: null, direction: "up", structurePoints: [] };
  function accumulate(data, candle, index, candles) {
    if (!data.reference) {
      data.reference = candle;
      return data;
    }
    switch (data.direction) {
      case "up": {
        //if(data.reference.upper < candle.upper || data.reference.high < candle.high || data.reference.low < candle.low || data.reference.lower < candle.lower) {
        if (
          data.reference.upper < candle.upper ||
          data.reference.high < candle.high
        ) {
          //if(data.reference.low < candle.low || data.reference.high < candle.high) {
          data.reference = candle;
          return data;
        }
        break;
      }
      case "down": {
        //if(data.reference.upper > candle.upper || data.reference.high > candle.high || data.reference.low > candle.low || data.reference.lower > candle.lower) {
        if (
          data.reference.low > candle.low ||
          data.reference.lower > candle.lower
        ) {
          //if(data.reference.low > candle.low || data.reference.high > candle.high) {
          data.reference = candle;
          return data;
        }
        break;
      }
    }
    data.structurePoints.push({
      ...data.reference,
      direction: data.direction,
      value: data.direction === "up" ? data.reference.high : data.reference.low,
    });
    data.reference = candle;
    data.direction = data.direction === "up" ? "down" : "up";
    return data;
  }
  return shownCandles
    .map((candle, index) => {
      return {
        index,
        ...candle,
        upper: Math.max(candle.open, candle.close),
        lower: Math.min(candle.open, candle.close),
      };
    })
    .reduce(accumulate, init)
    .structurePoints.map((point, index, points) => {
      const tmp = shownCandles.filter(
        (c) =>
          c.date > point.date &&
          ((point.direction === "down" && c.low < point.value) ||
            (point.direction === "up" && c.high > point.value))
      );
      if (tmp.length > 0) {
        return {
          mitigatedBy: tmp[0],
          mitigated: tmp[0].date,
          ...point,
        };
      }
      return point;
    });
}
