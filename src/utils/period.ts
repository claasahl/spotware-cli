import {
  ProtoOAQuoteType,
  ProtoOATrendbarPeriod,
} from "@claasahl/spotware-adapter";
import ms from "ms";

export function period(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.M1:
      return ms("1m");
    case ProtoOATrendbarPeriod.M2:
      return ms("2m");
    case ProtoOATrendbarPeriod.M3:
      return ms("3m");
    case ProtoOATrendbarPeriod.M4:
      return ms("4m");
    case ProtoOATrendbarPeriod.M5:
      return ms("5m");
    case ProtoOATrendbarPeriod.M10:
      return ms("10m");
    case ProtoOATrendbarPeriod.M15:
      return ms("15m");
    case ProtoOATrendbarPeriod.M30:
      return ms("30m");
    case ProtoOATrendbarPeriod.H1:
      return ms("1h");
    case ProtoOATrendbarPeriod.H4:
      return ms("4h");
    case ProtoOATrendbarPeriod.H12:
      return ms("12h");
    case ProtoOATrendbarPeriod.D1:
      return ms("1d");
    case ProtoOATrendbarPeriod.W1:
      return ms("1w");
    case ProtoOATrendbarPeriod.MN1:
      throw new Error("cannot convert 1MN to millis");
  }
}

export function maxTrendbarPeriod(period: ProtoOATrendbarPeriod): number {
  switch (period) {
    case ProtoOATrendbarPeriod.W1:
      return 158112000000;
    case ProtoOATrendbarPeriod.D1:
      return 31622400000;
    case ProtoOATrendbarPeriod.H4:
    case ProtoOATrendbarPeriod.H1:
    case ProtoOATrendbarPeriod.M30:
    case ProtoOATrendbarPeriod.M15:
      return 21168000000;
    case ProtoOATrendbarPeriod.M5:
      return 3024000000;
    case ProtoOATrendbarPeriod.M1:
      return 604800000;
    default:
      return 9999999999;
  }
}
export function maxQuotePeriod(type: ProtoOAQuoteType): number {
  switch (type) {
    case ProtoOAQuoteType.ASK:
    case ProtoOAQuoteType.BID:
    default:
      return 604800000;
  }
}
