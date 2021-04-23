import fs from "fs";
import { join } from "path";
import { ProtoOATickData, ProtoOATrendbar } from "@claasahl/spotware-protobuf";

import { Period, QuoteTypes, TrendbarPeriods } from "./types";

export async function write(
  dir: string,
  period: Period,
  type: QuoteTypes,
  tickData: ProtoOATickData[]
): Promise<void>;
export async function write(
  dir: string,
  period: Period,
  type: TrendbarPeriods,
  trendbars: ProtoOATrendbar[]
): Promise<void>;
export async function write(
  dir: string,
  period: Period,
  type: QuoteTypes | TrendbarPeriods,
  data: ProtoOATickData[] | ProtoOATrendbar[]
): Promise<void> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  const path = join(dir, type, file);
  await fs.promises.writeFile(path, JSON.stringify(data));
}
