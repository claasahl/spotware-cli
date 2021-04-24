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
  console.log(
    srv
      .sort(DB.comparePeriod)
      .map(forHumans)
      .filter((_, i) => i <= 5)
  );
  console.log("---------------- cli");
  console.log(
    cli
      .sort(DB.comparePeriod)
      .map(forHumans)
      .filter((_, i) => i <= 5)
  );
}

main();
