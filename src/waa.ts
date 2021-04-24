import {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";
import * as DB from "./database";
import { forHumans } from "./database";
import fs from "fs";

async function main() {
  const srv = await DB.readQuotePeriods(
    "./SERVER/EURUSD.DB",
    ProtoOAQuoteType.ASK
  );
  const cli = await DB.readQuotePeriods("./EURUSD.DB", ProtoOAQuoteType.ASK);
  console.log("---------------- srv");
  const dataSrv = await Promise.all(
    srv
      .sort(DB.comparePeriod)
      .filter((_, i) => i === 1)
      .map(async (p) => {
        const bars = await DB.readQuotes(
          "./SERVER/EURUSD.DB",
          p,
          ProtoOAQuoteType.ASK
        );
        return {
          ...forHumans(p),
          noTicks: bars.length,
          ticks: bars.map((b) => new Date(b.timestamp).toISOString()),
        };
      })
  );
  await fs.promises.writeFile("server.json", JSON.stringify(dataSrv, null, 2));

  console.log("---------------- cli");
  const dataCli = await Promise.all(
    cli
      .sort(DB.comparePeriod)
      .filter((_, i) => i === 1)
      .map(async (p) => {
        const bars = await DB.readQuotes(
          "./EURUSD.DB",
          p,
          ProtoOAQuoteType.ASK
        );
        return {
          ...forHumans(p),
          noTicks: bars.length,
          ticks: bars.map((b) => new Date(b.timestamp).toISOString()),
        };
      })
  );
  await fs.promises.writeFile("client.json", JSON.stringify(dataCli, null, 2));

  //   console.log("---------------- ");
  //   {
  //     const p: DB.Period = {
  //       // fromTimestamp: new Date("2021-02-25T00:00:00.000Z").getTime(),
  //       fromTimestamp: new Date("2021-02-14T22:00:00.000Z").getTime(),
  //       toTimestamp: new Date("2021-04-01T00:00:00.000Z").getTime(),
  //     };
  //     console.log(
  //       (
  //         await DB.readTrendbarsChunk(
  //           "./SERVER/EURUSD.DB",
  //           p,
  //           ProtoOATrendbarPeriod.W1
  //         )
  //       ).map((b) =>
  //         new Date((b.utcTimestampInMinutes || 0) * 60000).toISOString()
  //       )
  //     );
  //     console.log(
  //       await DB.readTrendbarsChunk(
  //         "./SERVER/EURUSD.DB",
  //         p,
  //         ProtoOATrendbarPeriod.W1
  //       )
  //     );
  //   }
}

main();
