import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";

export type Period = {
  fromTimestamp: number;
  toTimestamp: number;
  type: ProtoOAQuoteType;
};

export function isPeriod(object: any): object is Period {
  if (typeof object !== "object" || object === null) {
    return false;
  }
  return (
    typeof object.fromTimestamp === "number" &&
    typeof object.toTimestamp === "number" &&
    typeof object.type === "number"
  );
}
