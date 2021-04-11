import fs from "fs";
import path from "path";
import { ProtoOAQuoteType, ProtoOATickData } from "@claasahl/spotware-protobuf";

import { Period } from "./types";

export async function write(
  dir: string,
  type: ProtoOAQuoteType,
  tickData: ProtoOATickData[]
): Promise<Period> {
  const first = tickData[0].timestamp;
  const last = tickData[tickData.length - 1].timestamp;
  const period: Period = {
    fromTimestamp: Math.min(first, last),
    toTimestamp: Math.max(first, last),
    type,
  };

  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  await fs.promises.writeFile(path.join(dir, file), JSON.stringify(tickData));
  return period;
}
