// FIXME hardcoded ids
const BTCEUR = 22396;
const GBPSEK = 10093;
const EURGBP = 9;
const EURSEK = 47;
// const PRECISION = 5;
// Math.pow(10, PRECISION-pipPosition)
export function price(symbolId: number, price: number): number {
  switch (symbolId) {
    case GBPSEK: //1169480
    case EURGBP: //91870
    case EURSEK: //1053430
      return Math.round(price) / 100;
    case BTCEUR: //1090718000
      return Math.round(price / 1000) / 100; //Order price = 8212.251 has more digits than symbol allows. Allowed 2 digits
    default:
      throw new Error(`unknown symbol: ${symbolId}`);
  }
}
export default price;

// GBPSEK:    11.69480
//               ___| d:4,p:4
// EURGBP:      .91870
//               ___|_
// EURSEK:    10.53430
//               ___|
// BTCEUR: 10907.18000
//               |_
