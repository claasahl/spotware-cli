import fs from "fs";
import path from "path";
import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";

import { Period, isPeriod, comparePeriod } from "./types";
import { quoteDir, trendbarDir } from "./utils";

async function readPeriods(dir: string): Promise<Period[]> {
  const data: Period[] = [];
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    try {
      const name = path.basename(file, ".json");
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
export async function readQuotePeriods(
  dir: string,
  type: ProtoOAQuoteType
): Promise<Period[]> {
  const path = quoteDir(dir, type);
  return readPeriods(path);
}
export async function readTrendbarPeriods(
  dir: string,
  type: ProtoOATrendbarPeriod
): Promise<Period[]> {
  const path = trendbarDir(dir, type);
  return readPeriods(path);
}

async function read<T>(dir: string, period: Period): Promise<T[]> {
  const name = JSON.stringify(period);
  const file = Buffer.from(name).toString("base64") + ".json";
  const buffer = await fs.promises.readFile(path.join(dir, file));
  const tickData = JSON.parse(buffer.toString());
  if (Array.isArray(tickData)) {
    return tickData;
  }
  throw new Error(
    `contents of '${file}' were supposed to be an array, but wasn't`
  );
}

export async function readQuotes(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType
): Promise<ProtoOATickData[]> {
  const path = quoteDir(dir, type);
  return read(path, period);
}

export async function readTrendbars(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod
): Promise<ProtoOATrendbar[]> {
  const path = trendbarDir(dir, type);
  return read(path, period);
}
