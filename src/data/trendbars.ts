import {
  ProtoOAPayloadType,
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import { bullish, bearish, range } from "indicators";
import debug from "debug";

import * as R from "../client/requests";
import * as U from "../utils";

const log = debug("custom-client");

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
): Promise<U.Trendbar[]> {
  const trendbars: U.Trendbar[] = [];
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
    trendbars.push(
      ...U.trendbars({
        payloadType: ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_RES,
        payload: result,
      })
    );
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
  for (const period of options.periods) {
    const bars = await download(socket, options, period);
    for (let i = 1; i < bars.length; i++) {
      const first = bars[i - 1];
      const second = bars[i];
      const r = range(first);
      if (
        (bullish(first) && U.engulfed(first, second)) ||
        (bearish(first) && U.engulfed(first, second))
      ) {
        log(
          "inside-bar-pattern %s %s",
          ProtoOATrendbarPeriod[period],
          new Date(first.timestamp)
        );
      }
    }
  }
}
