import {
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbar,
  ProtoOATrendbarPeriod,
  PROTO_OA_SPOT_EVENT,
  SpotwareClientSocket,
} from "@claasahl/spotware-adapter";

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
  options: Pick<Options, "fromDate" | "toDate" | "period">
): number[] {
  const fromTimestamp = options.fromDate.getTime();
  const toTimestamp = options.toDate.getTime();
  const boundaries: number[] = [fromTimestamp];
  const step = interval(options.period);
  while (boundaries[boundaries.length - 1] + step < toTimestamp) {
    boundaries.push(boundaries[boundaries.length - 1] + step);
  }
  boundaries.push(toTimestamp);
  return boundaries;
}

async function* chunks(socket: SpotwareClientSocket, options: Options) {
  const { ctidTraderAccountId, symbolId, period } = options;
  const tmp = boundaries(options);
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
    yield result;
  }
}

function toSpotEvent(
  options: Pick<Options, "ctidTraderAccountId" | "symbolId" | "period">,
  trendbar: ProtoOATrendbar
): PROTO_OA_SPOT_EVENT {
  const { ctidTraderAccountId, symbolId, period } = options;
  const {
    volume,
    low = 0,
    deltaOpen,
    deltaHigh,
    deltaClose = 0,
    utcTimestampInMinutes,
  } = trendbar;
  return {
    payloadType: ProtoOAPayloadType.PROTO_OA_SPOT_EVENT,
    payload: {
      ctidTraderAccountId,
      symbolId,
      trendbar: [
        { volume, period, low, deltaOpen, deltaHigh, utcTimestampInMinutes },
      ],
      bid: low + deltaClose,
    },
  };
}

interface Options {
  ctidTraderAccountId: number;
  symbolId: number;
  period: ProtoOATrendbarPeriod;
  fromDate: Date;
  toDate: Date;
  cb: (msg: Messages) => void;
}
export async function download(socket: SpotwareClientSocket, options: Options) {
  for await (const chunk of chunks(socket, options)) {
    chunk.trendbar.map((t) => toSpotEvent(options, t)).forEach(options.cb);
  }
}
