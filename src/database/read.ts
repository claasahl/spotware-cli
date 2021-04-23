import fs from "fs";
import { basename, join } from "path";
import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";

import { Period, isPeriod, comparePeriod } from "./types";

export async function readPeriods(dir: string): Promise<Period[]> {
  const data: Period[] = [];
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    try {
      const name = basename(file, ".json");
      const text = Buffer.from(name, "base64").toString();
      const object = JSON.parse(text);
      if (isPeriod(object)) {
        data.push(object);
      }
    } catch {
      // ignore. This file is most likely not part of our database
    }
  }
  return data.sort(comparePeriod);
}

export async function readQuotes(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType
): Promise<ProtoOATickData[]> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  const path = join(dir, ProtoOAQuoteType[type], file);
  const buffer = await fs.promises.readFile(path);
  const tickData = JSON.parse(buffer.toString());
  if (Array.isArray(tickData)) {
    return tickData;
  }
  throw new Error(
    `contents of '${file}' were supposed to be an array, but wasn't`
  );
}

export async function readTrendbars(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod
): Promise<ProtoOATickData[]> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  const path = join(dir, ProtoOATrendbarPeriod[type], file);
  const buffer = await fs.promises.readFile(path);
  const tickData = JSON.parse(buffer.toString());
  if (Array.isArray(tickData)) {
    return tickData;
  }
  throw new Error(
    `contents of '${file}' were supposed to be an array, but wasn't`
  );
}
