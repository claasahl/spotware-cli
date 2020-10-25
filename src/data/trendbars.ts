import {
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import fs from "fs";

import * as R from "../client/requests";

function interval(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.H1:
      return 21168000000;
    case ProtoOATrendbarPeriod.M5:
      return 3024000000;
    default:
      return 99999999999;
  }
}

function boundaries(
  options: Pick<Options, "fromDate" | "toDate">,
  period: ProtoOATrendbarPeriod
): number[] {
  const fromTimestamp = options.fromDate.getTime();
  const toTimestamp = options.toDate.getTime();
  const boundaries: number[] = [fromTimestamp];
  const step = interval(period);
  while (boundaries[boundaries.length - 1] + step < toTimestamp) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }
  boundaries.push(toTimestamp);
  return boundaries;
}

async function download(
  socket: SpotwareClientSocket,
  options: Omit<Options, "periods">,
  period: ProtoOATrendbarPeriod
): Promise<ProtoOATrendbar[]> {
  const trendbars: ProtoOATrendbar[] = [];
  const { ctidTraderAccountId, symbolId } = options;
  const tmp = boundaries(options, period);
  for (let i = 1; i < tmp.length; i++) {
    const fromTimestamp = tmp[i - 1];
    const toTimestamp = tmp[i];
    const result = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
      ctidTraderAccountId,
      period,
      symbolId,
      fromTimestamp,
      toTimestamp,
    });
    trendbars.push(...result.trendbar);
  }
  return trendbars;
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  periods: ProtoOATrendbarPeriod[];
  fromDate: Date;
  toDate: Date;
}
export async function downloadTrendbars(
  socket: SpotwareClientSocket,
  options: Options
) {
  try {
    await fs.promises.stat(`./data/${options.symbolId}/`);
  } catch {
    await fs.promises.mkdir(`./data/${options.symbolId}/`);
  }

  for (const period of options.periods) {
    const trendbars = await download(socket, options, period);
    await fs.promises.writeFile(
      `./data/${options.symbolId}/trendbars-${ProtoOATrendbarPeriod[period]}.json`,
      JSON.stringify(trendbars)
    );
  }
}
