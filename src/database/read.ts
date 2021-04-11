import fs from "fs";
import path from "path";

import { Period, isPeriod } from "./types";

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
  return data;
}
