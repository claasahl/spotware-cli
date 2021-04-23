import { main as run, SymbolData } from "./runner";
import * as E from "./experiments";
import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";

function currencies(...names: string[]): (data: SymbolData) => boolean {
  return (data) => names.includes(data.symbol.symbolName || "");
}

const periods: ProtoOATrendbarPeriod[] = [
  ProtoOATrendbarPeriod.W1,
  ProtoOATrendbarPeriod.D1,
  ProtoOATrendbarPeriod.H4,
  ProtoOATrendbarPeriod.H1,
  ProtoOATrendbarPeriod.M15,
  ProtoOATrendbarPeriod.M5,
  ProtoOATrendbarPeriod.M1,
];

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

  for (const period of periods) {
    await run({
      process: E.trendbars({
        fromDate,
        toDate,
        processSymbol,
        period,
      }),
    });
  }
  await run({
    process: E.ticks({
      fromDate,
      toDate,
      processSymbol,
    }),
  });
}
main();
