import fs from "fs";
import path from "path";
import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";

import { Period } from "./types";
import { quoteDir, trendbarDir, mkdir } from "./utils";

async function write(
  dir: string,
  period: Period,
  data: ProtoOATickData[] | ProtoOATrendbar[]
): Promise<void> {
  await mkdir(dir);
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  await fs.promises.writeFile(path.join(dir, file), JSON.stringify(data));
}

export async function writeQuotes(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType,
  data: ProtoOATickData[]
): Promise<void> {
  const path = quoteDir(dir, type);
  return write(path, period, data);
}
export async function writeTrendbars(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod,
  data: ProtoOATrendbar[]
): Promise<void> {
  const path = trendbarDir(dir, type);
  return write(path, period, data);
}
