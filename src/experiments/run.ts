import fs from "fs";

import { Experiment } from "./experiment";
import { readJsonSync } from "./files";
import { Trendbar } from "../types";
import { snapshots } from "./snapshots";
import { signals } from "../magic/threeDucks/signals";
import { tap, flatMap, filter, distinctUntilChanged } from "rxjs/operators";

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

const recommender = signals();
snapshots(dataH4, dataH1, dataM5)
  .pipe(
    tap(snapshot => recommender.update(snapshot)),
    flatMap(({ h4, h1, m5 }) => [
      { signal: recommender.recommend(m5.open), price: m5.open, h4, h1, m5 },
      { signal: recommender.recommend(m5.high), price: m5.high, h4, h1, m5 },
      { signal: recommender.recommend(m5.low), price: m5.low, h4, h1, m5 },
      { signal: recommender.recommend(m5.close), price: m5.close, h4, h1, m5 }
    ]),
    filter(value => value.signal !== "NEUTRAL"),
    distinctUntilChanged(
      (x, y) => x.m5.timestamp === y.m5.timestamp && x.signal === y.signal
    )
  )
  .subscribe(a => console.log(JSON.stringify(a)));
