import * as $ from "@claasahl/spotware-adapter";
import fs from "fs";
import { test } from "indicators";

import { Experiment } from "./experiment";
import { readJsonSync, writeJsonSync } from "./files";
import { Trendbar, Snapshot } from "../types";
import { snapshots } from "./snapshots";
import {
  tap,
  flatMap,
  filter,
  distinctUntilChanged,
  map,
  toArray,
  shareReplay,
  distinctUntilKeyChanged
} from "rxjs/operators";
import { periodToMillis } from "../utils";
import { riskReward } from "../operators";
import { from } from "rxjs";
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
  return test([m5], "bullish").map(signal => ({ signal, h4, h1, m5 }));
}

const MIN = 60000;
const LOOK_AHEAD = 30 * MIN;
const INITIAL = { duration: "0ms", durationMS: 0, ratio: Number.MIN_VALUE };

const signalData = snapshots(dataH4, dataH1, dataM5).pipe(
  flatMap(recommendations),
  filter(value => value.signal !== "NEUTRAL"),
  distinctUntilChanged(
    (x, y) => x.m5.timestamp === y.m5.timestamp && x.signal === y.signal
  )
);

const futureData = signalData.pipe(
  map(signal => {
    const begin =
      signal.m5.timestamp + periodToMillis($.ProtoOATrendbarPeriod.M5);
    const end = begin + LOOK_AHEAD;
    const future = dataM1.filter(
      ({ timestamp }) => begin <= timestamp && timestamp < end
    );
    return { signal, future };
  }),
  filter(signal => signal.future.length > 0)
);
const riskRewardData = futureData.pipe(
  flatMap(async signal => {
    const { close, timestamp, period } = signal.signal.m5;
    const referenceTimestamp = timestamp + periodToMillis(period);
    const data = await from(signal.future)
      .pipe(
        map(bar => ({ ...bar, date: new Date(bar.date) })),
        riskReward(close, referenceTimestamp),
        filter(
          value =>
            Number.isFinite(value.ratio_buy) &&
            Number.isFinite(value.ratio_sell)
        ),
        distinctUntilKeyChanged("ratio_buy"),
        toArray()
      )
      .toPromise();
    return { ...signal, riskReward: data };
  })
);
const data = riskRewardData.pipe(
  filter(value => value.riskReward.length > 0),
  map(value => ({
    ...value,
    bestRiskRewardBuy: value.riskReward.reduce((acc, curr) => {
      if (Math.max(acc.ratio, curr.ratio_buy) !== acc.ratio) {
        const { duration, durationMS, ratio_buy: ratio } = curr;
        return { duration, durationMS, ratio };
      }
      return acc;
    }, INITIAL)
  })),
  map(value => ({
    ...value,
    bestRiskRewardSell: value.riskReward.reduce((acc, curr) => {
      if (Math.max(acc.ratio, curr.ratio_sell) !== acc.ratio) {
        const { duration, durationMS, ratio_sell: ratio } = curr;
        return { duration, durationMS, ratio };
      }
      return acc;
    }, INITIAL)
  })),
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
      const {
        duration: buy_duration,
        durationMS: buy_durationMS,
        ratio: buy_ratio
      } = signal.bestRiskRewardBuy;
      const {
        duration: sell_duration,
        durationMS: sell_durationMS,
        ratio: sell_ratio
      } = signal.bestRiskRewardSell;
      return {
        date,
        timestamp,
        recommendation,
        buy_duration,
        buy_durationMS,
        buy_ratio,
        sell_duration,
        sell_durationMS,
        sell_ratio
      };
    }),
    toArray(),
    tap(values => {
      const stream = fs.createWriteStream("./signals.csv");
      stream.write(
        "date;timestamp;recommendation;buy_duration;buy_durationMS;buy_ratio;sell_duration;sell_durationMS;sell_ratio" +
          EOL
      );
      values.forEach(value => {
        const {
          date,
          timestamp,
          recommendation,
          buy_duration,
          buy_durationMS,
          buy_ratio,
          sell_duration,
          sell_durationMS,
          sell_ratio
        } = value;
        const line = `${date};${timestamp};${recommendation};${buy_duration};${buy_durationMS};${buy_ratio};${sell_duration};${sell_durationMS};${sell_ratio};${EOL}`;
        stream.write(line);
      });
      stream.close();
    })
  )
  .subscribe();
