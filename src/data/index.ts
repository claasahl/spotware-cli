import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

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
  const toDate = new Date("2021-02-15T00:00:00.000Z");

  await run({
    process: E.deals({
      fromDate,
      toDate,
      processSymbol,
    }),
  });
  await run({
    process: E.highLow({
      fromDate,
      toDate,
      processSymbol,
    }),
  });
  await run({
    process: E.metrics({
      processSymbol,
      fromDate,
      toDate,
      period: ProtoOATrendbarPeriod.M1,
    }),
  });
}
main();
