// FIXME hardcoded ids
const BTCEUR = 22396;
const GBPSEK = 10093;
const EURGBP = 9;
const EURSEK = 47;
export function pips(symbolId: number, pips: number): number {
  switch (symbolId) {
    case GBPSEK:
    case EURGBP:
    case EURSEK:
      return pips * 10;
    case BTCEUR:
      return pips * 10000;
    default:
      throw new Error(`unknown symbol: ${symbolId}`);
  }
}
export default pips;
