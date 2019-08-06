import * as $ from "@claasahl/spotware-adapter";
import fs from "fs";

import { Experiment } from "./experiment";
import { readJsonSync, writeJsonSync } from "./files";
import { Trendbar, Snapshot } from "../types";
import { snapshots } from "./snapshots";
import { signals } from "../magic/threeDucks/signals";
import {
  tap,
  flatMap,
  filter,
  distinctUntilChanged,
  map,
  toArray,
  shareReplay,
  groupBy,
  scan,
  mergeMap,
  last
} from "rxjs/operators";
import { periodToMillis } from "../utils";
import { EOL } from "os";

const experiment: Experiment = JSON.parse(
  fs
    .readFileSync(
      "./experiments/2019-08-06T105927773Z--getting started/experiment.json"
    )
    .toString()
);

const dataH4: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-H4.json"
);
const dataH1: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-H1.json"
);
const dataM5: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-M5.json"
);
const dataM1: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-M1.json"
);

function recommendations(snaphot: Snapshot) {
  const { h4, h1, m5 } = snaphot;
  if (!m5) {
    return [];
  }
  return [
    { signal: recommender.recommend(m5.open), price: m5.open, h4, h1, m5 },
    { signal: recommender.recommend(m5.high), price: m5.high, h4, h1, m5 },
    { signal: recommender.recommend(m5.low), price: m5.low, h4, h1, m5 },
    { signal: recommender.recommend(m5.close), price: m5.close, h4, h1, m5 }
  ];
}

const recommender = signals();
const data = snapshots(dataH4, dataH1, dataM5).pipe(
  tap(snapshot => recommender.update(snapshot)),
  flatMap(recommendations),
  filter(value => value.signal !== "NEUTRAL"),
  distinctUntilChanged(
    (x, y) => x.m5.timestamp === y.m5.timestamp && x.signal === y.signal
  ),
  map(signal => {
    const MIN = 60000;
    const begin =
      signal.m5.timestamp + periodToMillis($.ProtoOATrendbarPeriod.M5);
    const end = begin + 30 * MIN;
    const future = dataM1.filter(
      ({ timestamp }) => begin <= timestamp && timestamp < end
    );
    return { signal, future };
  }),
  map(signal => {
    const highLow = signal.future.reduce(
      (prev, curr) => {
        const next = { ...prev };
        if (prev.low > curr.low) {
          next.low = curr.low;
        }
        if (prev.high < curr.high) {
          next.high = curr.high;
        }
        return next;
      },
      { low: Number.MAX_VALUE, high: Number.MIN_VALUE }
    );
    return { ...signal, highLow };
  }),
  map(signal => {
    const reference = signal.signal.m5.close;
    const { high, low } = signal.highLow;
    const highLowRel = { low: low - reference, high: high - reference };
    return { ...signal, highLowRel };
  }),
  shareReplay()
);

data
  .pipe(
    toArray(),
    tap(values => writeJsonSync(experiment, "results_signals.json", values))
  )
  .subscribe();
data
  .pipe(
    map(signal => {
      const { date, timestamp } = signal.signal.m5;
      const recommendation = signal.signal.signal;
      const { highLowRel } = signal;
      return { date, timestamp, recommendation, highLowRel };
    }),
    toArray(),
    tap(values => writeJsonSync(experiment, "results_summary.json", values)),
    tap(values => {
      const header = "date;timestamp;signal;high;low";
      const data = values
        .map(
          v =>
            `${v.date};${v.timestamp};${v.recommendation};${v.highLowRel.high};${v.highLowRel.low}`
        )
        .join(EOL);
      fs.writeFileSync("./summary.csv", header + EOL + data);
    })
  )
  .subscribe();
data
  .pipe(
    groupBy(signal => signal.signal.signal),
    mergeMap(data =>
      data.pipe(
        scan(
          (acc, value) => {
            const { low, high } = value.highLowRel;
            return {
              ...acc,
              lowSum: acc.lowSum + low,
              highSum: acc.highSum + high,
              count: acc.count + 1
            };
          },
          { signal: data.key, lowSum: 0, highSum: 0, count: 0 }
        ),
        last()
      )
    ),
    map(data => ({
      ...data,
      lowAvg: data.lowSum / data.count,
      highAvg: data.highSum / data.count
    })),
    toArray(),
    tap(values => writeJsonSync(experiment, "results_matrix.json", values))
  )
  .subscribe();
