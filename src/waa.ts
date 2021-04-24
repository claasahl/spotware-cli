import { ProtoOATrendbarPeriod } from "@claasahl/spotware-protobuf";
import * as DB from "./database";
import { forHumans } from "./database";

async function main() {
  const srv = await DB.readTrendbarPeriods(
    "./SERVER/EURUSD.DB",
    ProtoOATrendbarPeriod.W1
  );
  const cli = await DB.readTrendbarPeriods(
    "./EURUSD.DB",
    ProtoOATrendbarPeriod.W1
  );
  console.log("---------------- srv");
  for (const p of srv.sort(DB.comparePeriod).filter((_, i) => i <= 5)) {
    const bars = await DB.readTrendbars(
      "./SERVER/EURUSD.DB",
      p,
      ProtoOATrendbarPeriod.W1
    );
    const first = new Date(
      (bars[0].utcTimestampInMinutes || 0) * 60000
    ).toISOString();
    const last = new Date(
      (bars[bars.length - 1].utcTimestampInMinutes || 0) * 60000
    ).toISOString();
    console.log({
      ...forHumans(p),
      bars: bars.length,
      first,
      last,
    });
  }

  console.log("---------------- cli");
  for (const p of cli.sort(DB.comparePeriod).filter((_, i) => i <= 5)) {
    const bars = await DB.readTrendbars(
      "./EURUSD.DB",
      p,
      ProtoOATrendbarPeriod.W1
    );
    const first = new Date(
      (bars[0].utcTimestampInMinutes || 0) * 60000
    ).toISOString();
    const last = new Date(
      (bars[bars.length - 1].utcTimestampInMinutes || 0) * 60000
    ).toISOString();
    console.log({
      ...forHumans(p),
      bars: bars.length,
      first,
      last,
    });
  }
}

main();
