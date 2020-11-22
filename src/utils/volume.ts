export function volume(
  price1: number,
  price2: number,
  risk: number,
  step = 100000,
  convert = false
) {
  const entry = Math.max(price1, price2);
  const close = Math.min(price1, price2);
  const riskInCorrectCurrency = risk / (convert ? entry : 1);
  const volume = (riskInCorrectCurrency * close) / (entry - close);
  return Math.round((volume * 100) / step) * step;
}
