import { fromFiles } from "../services/local";
import ms from "ms";

export default function main(symbolName: string) {
  // about 18s (with DEBUG="*")
  // about 4s (without DEBUG="*")
  // about 4s (with DEBUG="account:*,order:*")
  const time = Date.now();
  process.on("exit", () => {
    console.log(ms(Date.now() - time));
    console.log("node --prof-process isolate-000002054DC3BEF0-13692-v8.log > process.txt")
  })

  const symbol = Symbol.for(symbolName);
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
