import { fromLogFiles, fr0mLogFiles } from "./services/local";
import ms from "ms";

function main() {
  // about 25s (with DEBUG="*")
  // about 7s (without DEBUG="*")
  // about 7s (with DEBUG="account:*,order:*")
  const time = Date.now();
  process.on("exit", () => console.log(ms(Date.now() - time)))

  const symbol = Symbol.for("BTC/EUR");
  const spots = fromLogFiles({
    paths: [
      "./store/2020-04-27.log",
      "./store/2020-04-28.log",
      "./store/2020-04-29.log",
      "./store/2020-04-30.log",
      "./store/2020-05-01.log",
    ], symbol
  });
  spots.on("ask", () => { })
  spots.on("bid", () => { })
}
main;

async function main2() {
  // about 3s
  const time = Date.now();
  process.on("exit", () => console.log(ms(Date.now() - time)))

  const iterator = fr0mLogFiles([
    "./store/2020-04-27.log",
    "./store/2020-04-28.log",
    "./store/2020-04-29.log",
    "./store/2020-04-30.log",
    "./store/2020-05-01.log",
  ])
  let count = 0
  for await (const a of iterator) {
    a
    setImmediate(() => count++)
  }
  console.log(count)
}
main2();
