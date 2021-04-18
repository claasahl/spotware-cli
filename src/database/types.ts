import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";

export type Period = {
  /**
   * period starts with this timestamp (inculsive)
   */
  fromTimestamp: number;

  /**
   * period ends with this timestamp (exvlusive)
   */
  toTimestamp: number;
};

export function isPeriod(object: any): object is Period {
  if (typeof object !== "object" || object === null) {
    return false;
  }
  return (
    typeof object.fromTimestamp === "number" &&
    typeof object.toTimestamp === "number"
  );
}

export function comparePeriod(a: Period, b: Period): number {
  return a.fromTimestamp - b.fromTimestamp + a.toTimestamp - b.toTimestamp;
}
