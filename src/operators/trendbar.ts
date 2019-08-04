import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";

import { Trendbar } from "../types";

export function trendbar(
  period = $.ProtoOATrendbarPeriod.MN1
): OperatorFunction<$.ProtoOATrendbar, Trendbar> {
  return map(
    ({
      volume,
      low = 0,
      deltaClose = 0,
      deltaHigh = 0,
      deltaOpen = 0,
      utcTimestampInMinutes = 0
    }) => ({
      volume,
      period,
      low,
      open: low + deltaOpen,
      close: low + deltaClose,
      high: low + deltaHigh,
      timestamp: utcTimestampInMinutes * 60000,
      date: new Date(utcTimestampInMinutes * 60000)
    })
  );
}
