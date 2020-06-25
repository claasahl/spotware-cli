import { fromFiles } from "./services/local";
import ms from "ms";

function main() {
  // about 18s (with DEBUG="*")
  // about 4s (without DEBUG="*")
  // about 4s (with DEBUG="account:*,order:*")
  const time = Date.now();
  process.on("exit", () => console.log(ms(Date.now() - time)))

  const symbol = Symbol.for("BTC/EUR");
  const spots = fromFiles({
    paths: [
      "./store/2020-04-27.log",
      "./store/2020-04-28.log",
      "./store/2020-04-29.log",
      "./store/2020-04-30.log",
      "./store/2020-05-01.log",
    ], symbol
  });
  spots.on("data", () => { })
}
main();
