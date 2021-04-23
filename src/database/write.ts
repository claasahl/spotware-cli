import fs from "fs";
import { join } from "path";
import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";

import { Period } from "./types";

export async function write(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType,
  tickData: ProtoOATickData[]
): Promise<void>;
export async function write(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod,
  trendbars: ProtoOATrendbar[]
): Promise<void>;
export async function write(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType | ProtoOATrendbarPeriod,
  data: ProtoOATickData[] | ProtoOATrendbar[]
): Promise<void> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  const path = join(
    dir,
    ProtoOAQuoteType[type] || ProtoOATrendbarPeriod[type],
    file
  );
  await fs.promises.writeFile(path, JSON.stringify(data));
}
