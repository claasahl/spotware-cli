import { main as run, SymbolData } from "./runner";
import * as E from "./experiments";

function currencies(...names: string[]): (data: SymbolData) => boolean {
  return (data) => names.includes(data.symbol.symbolName || "");
}

async function main() {
  const processSymbol = currencies(
    // "EURGBP",
    "EURUSD"
    // "EURAUD",
    // "EURNZD",
    // "EURJPY",
    // "EURCHF",
    // "EURCAD"
  );
  const fromDate = new Date("2019-12-01T00:00:00.000Z");
  const toDate = new Date("2021-02-21T00:00:00.000Z");

  await run({
    process: E.ticks({
      fromDate,
      toDate,
      processSymbol,
    }),
  });
}
main();
