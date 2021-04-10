import { ProtoOAQuoteType } from "@claasahl/spotware-protobuf";

export type Index = {
  symbolId: number;
  symbolName: string;
  fromTimestamp: number;
  toTimestamp: number;
  type: ProtoOAQuoteType;
};

export type Period = {
  fromTimestamp: number;
  toTimestamp: number;
  type: ProtoOAQuoteType;
};
