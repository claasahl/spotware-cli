import * as $ from "@claasahl/spotware-adapter";

const MIN = 60000;
export function periodToMillis(period: $.ProtoOATrendbarPeriod): number {
  switch (period) {
    case $.ProtoOATrendbarPeriod.M1:
      return MIN;
    case $.ProtoOATrendbarPeriod.M2:
      return 2 * MIN;
    case $.ProtoOATrendbarPeriod.M3:
      return 3 * MIN;
    case $.ProtoOATrendbarPeriod.M4:
      return 4 * MIN;
    case $.ProtoOATrendbarPeriod.M5:
      return 5 * MIN;
    case $.ProtoOATrendbarPeriod.M10:
      return 10 * MIN;
    case $.ProtoOATrendbarPeriod.M15:
      return 15 * MIN;
    case $.ProtoOATrendbarPeriod.M30:
      return 30 * MIN;
    case $.ProtoOATrendbarPeriod.H1:
      return 60 * MIN;
    case $.ProtoOATrendbarPeriod.H4:
      return 240 * MIN;
    case $.ProtoOATrendbarPeriod.H12:
      return 720 * MIN;
    case $.ProtoOATrendbarPeriod.D1:
      return 1440 * MIN;
    case $.ProtoOATrendbarPeriod.W1:
      return 10080 * MIN;
    case $.ProtoOATrendbarPeriod.MN1:
      throw new Error(
        "millis for period MN1 is not supported, because it is changes throughout the year"
      );
    default:
      throw new Error(`unknown period: ${period}`);
  }
}
export default periodToMillis;
