import * as $ from "@claasahl/spotware-adapter";
import { Subject, combineLatest } from "rxjs";
import fs from "fs";

import { Experiment } from "./experiment";
import { readJsonSync } from "./files";
import { periodToMillis } from "../utils";
import { filter, tap, flatMap } from "rxjs/operators";
import { signa1 } from "../magic/threeDucks/signals";
import { Trendbar } from "../types";

const experiment: Experiment = JSON.parse(
  fs
    .readFileSync(
      "./experiments/2019-08-04T111422294Z--getting started/experiment.json"
    )
    .toString()
);

const dataH4: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-EURSEK-H4.json"
);
const dataH1: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-EURSEK-H1.json"
);
const dataM5: Trendbar[] = readJsonSync(
  experiment,
  "trendbars-5291983-EURSEK-M5.json"
);
const iterH4 = dataH4[Symbol.iterator]();
const iterH1 = dataH1[Symbol.iterator]();
const iterM5 = dataM5[Symbol.iterator]();
const iterLive = dataM5[Symbol.iterator]();

const h4 = new Subject<Trendbar>();
const h1 = new Subject<Trendbar>();
const m5 = new Subject<Trendbar>();

function engulfed(inner: Trendbar, outer: Trendbar): boolean {
  const outerBegin = outer.timestamp;
  const innerBegin = inner.timestamp;
  const innerEnd = inner.timestamp + periodToMillis(inner.period);
  const outerEnd = outer.timestamp + periodToMillis(outer.period);
  return (
    outerBegin <= innerBegin &&
    innerBegin <= outerEnd &&
    outerBegin <= innerEnd &&
    innerEnd <= outerEnd
  );
}
const AAA: Trendbar = {} as any;
const dummy = {
  d1: AAA,
  h12: AAA,
  h4: AAA,
  h1: AAA,
  m30: AAA,
  m20: AAA,
  m15: AAA,
  m10: AAA,
  m5: AAA,
  m4: AAA,
  m3: AAA,
  m2: AAA,
  m1: AAA
};
const recommender = signa1();
combineLatest(h4, h1, m5, (h4, h1, m5) => [h4, h1, m5])
  .pipe(
    filter(([h4, h1, m5]) => {
      return engulfed(m5, h1) && engulfed(h1, h4);
    }),
    tap(([h4, h1, m5]) =>
      console.log(JSON.stringify([h4.date, h1.date, m5.date]))
    ),
    tap(([h4, h1, m5]) => recommender.update({ ...dummy, h4, h1, m5 })),
    flatMap(([h4, h1, m5]) => [
      { h4, h1, m5, price: m5.open, signal: recommender.recommend(m5.open) },
      { h4, h1, m5, price: m5.high, signal: recommender.recommend(m5.high) },
      { h4, h1, m5, price: m5.low, signal: recommender.recommend(m5.low) },
      { h4, h1, m5, price: m5.close, signal: recommender.recommend(m5.close) }
    ]),
    filter(value => value.signal !== "NEUTRAL")
  )
  .subscribe(a => console.log(JSON.stringify(a)));

iterLive.next();
const values = {
  h4: iterH4.next(),
  h1: iterH1.next(),
  m5: iterM5.next()
};

function allDone(): boolean {
  const h4 = values.h4 ? values.h4.done : false;
  const h1 = values.h1 ? values.h1.done : false;
  const m5 = values.m5 ? values.m5.done : false;
  return h4 && h1 && m5;
}
function overlaps(
  timestampA: number,
  timestampB: number,
  periodB: $.ProtoOATrendbarPeriod
) {
  return (
    timestampB <= timestampA &&
    timestampA < timestampB + periodToMillis(periodB)
  );
}
while (!allDone()) {
  const timestampM5 = values.m5.value.timestamp;
  m5.next(values.m5.value);
  values.m5 = iterM5.next();

  if (!values.h1.done) {
    const timestampH1 = values.h1.value.timestamp;
    if (overlaps(timestampM5, timestampH1, $.ProtoOATrendbarPeriod.H1)) {
      h1.next(values.h1.value);
      values.h1 = iterH1.next();
    }
  }

  if (!values.h4.done) {
    const timestampH4 = values.h4.value.timestamp;
    if (overlaps(timestampM5, timestampH4, $.ProtoOATrendbarPeriod.H4)) {
      h4.next(values.h4.value);
      values.h4 = iterH4.next();
    }
  }
}
