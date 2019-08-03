// FIXME hardcoded ids
const BTCEUR = 22396;
const GBPSEK = 10093;
const EURGBP = 9;
const EURSEK = 47;
export function volume(symbolId: number, volume: number): number {
  switch (symbolId) {
    case GBPSEK:
    case EURGBP:
    case EURSEK:
      return volume * 10000000;
    case BTCEUR:
      return volume * 100;
    default:
      throw new Error(`unknown symbol: ${symbolId}`);
  }
}
export default volume;
