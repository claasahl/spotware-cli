import fs from "fs";
import path from "path";
import { ProtoOATickData, ProtoOATrendbar } from "@claasahl/spotware-protobuf";

import { Period } from "./types";

export async function write(
  dir: string,
  period: Period,
  tickData: ProtoOATickData[] | ProtoOATrendbar[]
): Promise<void> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  await fs.promises.writeFile(path.join(dir, file), JSON.stringify(tickData));
}
