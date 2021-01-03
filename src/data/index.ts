import { ProtoOATrendbarPeriod } from "@claasahl/spotware-adapter";

import * as R from "./runner";
import { SymbolData } from "./runner/types";

const classes = ["Forex", "Crypto Currency"];
function accountCurrencies(data: SymbolData): boolean {
  if (!classes.includes(data.assetClass.name || "")) {
    return false;
  }
  if (!data.symbol.symbolName?.includes(data.depositAsset.name)) {
    return false;
  }
  return true;
}

function currencies(...names: string[]): (data: SymbolData) => boolean {
  return (data) => names.includes(data.symbol.symbolName || "");
}

async function main() {
  const processSymbol = currencies(
    "EURGBP",
    "EURUSD",
    "EURAUD",
    "EURNZD",
    "EURJPY",
    "EURCHF",
    "EURCAD"
  );
  const fromDate = new Date("2019-12-01T00:00:00.000Z");
  const toDate = new Date("2020-12-01T00:00:00.000Z");

  await R.main({ process: R.highLow({ processSymbol, fromDate, toDate }) });
  await R.main({
    process: R.metrics({
      processSymbol,
      fromDate,
      toDate,
      period: ProtoOATrendbarPeriod.M5,
    }),
  });
  await R.main({ process: R.deals({ processSymbol, fromDate, toDate }) });
}
main();
