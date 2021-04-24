import fs from "fs";
import path from "path";
import {
  ProtoOAQuoteType,
  ProtoOATickData,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-protobuf";

import { Period, isPeriod, comparePeriod } from "./types";
import { quoteDir, trendbarDir, mkdir, intersects } from "./utils";
import { retainAvailablePeriods } from "./split";
import * as U from "../utils";

async function readPeriods(dir: string): Promise<Period[]> {
  const data: Period[] = [];
  await mkdir(dir);
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
  await mkdir(dir);
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

export async function readQuotesChunk(
  dir: string,
  period: Period,
  type: ProtoOAQuoteType
): Promise<ProtoOATickData[]> {
  const available = await readQuotePeriods(dir, type);
  const periods = retainAvailablePeriods(period, available).sort(comparePeriod);

  if (periods.length > 0) {
    const tmp = available.filter((p) =>
      intersects(p, periods[periods.length - 1])
    );
    const tickData = (await readQuotes(dir, tmp[0], type)).filter(
      (t) =>
        period.fromTimestamp <= t.timestamp && t.timestamp < period.toTimestamp
    );
    for (let index = tickData.length - 1; index > 0; index--) {
      const curr = tickData[index];
      const prev = tickData[index - 1];
      tickData[index] = {
        tick: curr.tick - prev.tick,
        timestamp: curr.timestamp - prev.timestamp,
      };
    }
    return tickData;
  }

  return [];
}

export async function readTrendbars(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod
): Promise<ProtoOATrendbar[]> {
  const path = trendbarDir(dir, type);
  return read(path, period);
}

export async function readTrendbarsChunk(
  dir: string,
  period: Period,
  type: ProtoOATrendbarPeriod
): Promise<ProtoOATrendbar[]> {
  const available = await readTrendbarPeriods(dir, type);
  const periods = retainAvailablePeriods(period, available).sort(comparePeriod);

  if (periods.length > 0) {
    const tmp = available.filter((p) =>
      intersects(p, periods[periods.length - 1])
    );
    const trendbars = (await readTrendbars(dir, tmp[0], type)).filter((t) => {
      if (typeof t.utcTimestampInMinutes !== "number") {
        return false;
      }
      const timestamp = t.utcTimestampInMinutes * 60000;
      return (
        period.fromTimestamp - U.period(type) <= timestamp &&
        timestamp <= period.toTimestamp
      );
    });
    return trendbars;
  }

  return [];
}
