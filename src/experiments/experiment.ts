import * as $ from "@claasahl/spotware-adapter";
import uuid from "uuid/v1";
import ms from "ms";

export interface ExperimentConfig {
  readonly port: number;
  readonly host: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly accessToken: string;
  readonly symbolName: string;
  readonly fromDate: string;
  readonly toDate: string;
  readonly label: string;
  readonly dir: string;
}

export interface Interval {
  readonly fromDate: string;
  readonly toDate: string;
  readonly fromTimestamp: number;
  readonly toTimestamp: number;
}

export interface Experiment {
  readonly uuid: string;
  readonly name: string;
  readonly config: ExperimentConfig;
  readonly intervals: Interval[];
  readonly periods: $.ProtoOATrendbarPeriod[];
}

function intervalFrom(fromTimestamp: number, toTimestamp: number): Interval {
  if (fromTimestamp > toTimestamp) {
    throw new Error(
      `invalid interval: ${new Date(fromTimestamp)} -> ${new Date(toTimestamp)}`
    );
  }
  return {
    fromDate: new Date(fromTimestamp).toISOString(),
    toDate: new Date(toTimestamp).toISOString(),
    fromTimestamp,
    toTimestamp
  };
}

function intervals(
  config: ExperimentConfig,
  period: string = "7d"
): Interval[] {
  const periodOffset = ms(period);
  const fromTimestamp = new Date(config.fromDate).getTime();
  const toTimestamp = new Date(config.toDate).getTime();
  const intervals: Interval[] = [
    intervalFrom(fromTimestamp, fromTimestamp + periodOffset)
  ];
  while (intervals[intervals.length - 1].toTimestamp < toTimestamp) {
    const { toTimestamp: lastTimestamp } = intervals[intervals.length - 1];
    intervals.push(intervalFrom(lastTimestamp, lastTimestamp + periodOffset));
  }
  intervals[intervals.length - 1] = {
    ...intervals[intervals.length - 1],
    toTimestamp,
    toDate: new Date(toTimestamp).toISOString()
  };
  return intervals;
}

function periods(): $.ProtoOATrendbarPeriod[] {
  return [
    $.ProtoOATrendbarPeriod.M1,
    $.ProtoOATrendbarPeriod.M2,
    $.ProtoOATrendbarPeriod.M3,
    $.ProtoOATrendbarPeriod.M4,
    $.ProtoOATrendbarPeriod.M5,
    $.ProtoOATrendbarPeriod.M10,
    $.ProtoOATrendbarPeriod.M15,
    $.ProtoOATrendbarPeriod.M30,
    $.ProtoOATrendbarPeriod.H1,
    $.ProtoOATrendbarPeriod.H4,
    $.ProtoOATrendbarPeriod.H12,
    $.ProtoOATrendbarPeriod.D1
  ];
}

export function create(config: ExperimentConfig): Experiment {
  const id = uuid();
  const name = `${uuid()}-${config.label}`;
  return {
    uuid: id,
    name,
    config,
    intervals: intervals(config),
    periods: periods()
  };
}
