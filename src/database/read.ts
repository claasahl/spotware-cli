import fs from "fs";
import path from "path";
import { ProtoOATickData } from "@claasahl/spotware-protobuf";

import { Period, isPeriod, comparePeriod } from "./types";

async function mkdir(dir: string): Promise<void> {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore... for now
  }
}

export async function readPeriods(dir: string): Promise<Period[]> {
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

export async function read(
  dir: string,
  period: Period
): Promise<ProtoOATickData[]> {
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
