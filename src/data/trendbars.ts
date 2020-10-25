import {
  ProtoOATrendbarPeriod,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";
import fs from "fs";

import * as R from "../client/requests";

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
  const { ctidTraderAccountId, symbolId, fromDate, toDate } = options;
  for (const period of options.periods) {
    const trendbars = await R.PROTO_OA_GET_TRENDBARS_REQ(socket, {
      ctidTraderAccountId,
      period,
      symbolId,
      fromTimestamp: fromDate.getTime(),
      toTimestamp: toDate.getTime(),
    });
    await fs.promises.writeFile(
      `trendbars-${ProtoOATrendbarPeriod[period]}.json`,
      JSON.stringify(trendbars, null, 2)
    );
  }
}
