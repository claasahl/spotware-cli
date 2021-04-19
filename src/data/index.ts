import { main as run, SymbolData } from "./runner";
import * as E from "./experiments";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";

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
  const fromDate = new Date("2019-01-01T00:00:00.000Z");
  const toDate = new Date("2021-04-01T00:00:00.000Z");

  await run({
    process: E.trendbars({
      fromDate,
      toDate,
      processSymbol,
      period: ProtoOATrendbarPeriod.M1,
    }),
  });
  await run({
    process: E.ticks({
      fromDate,
      toDate,
      processSymbol,
    }),
  });
}
main();
