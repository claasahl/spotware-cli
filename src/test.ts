import { BehaviorSubject, merge } from "rxjs";
import { pairwise, map, skip } from "rxjs/operators";

type Match = number;
const bullishMatches = new BehaviorSubject<Match>(0);
const bearishMatches = new BehaviorSubject<Match>(0);
const matches = merge(
  bullishMatches.pipe(skip(1)),
  bearishMatches.pipe(skip(1))
);

const closeOrCancelOrder = new BehaviorSubject<Match>(0);
const newOrder = new BehaviorSubject<Match>(0);

matches.subscribe(newOrder);
matches
  .pipe(
    pairwise(),
    map(([prevMatch, _currMatch]) => prevMatch)
  )
  .subscribe(closeOrCancelOrder);

closeOrCancelOrder.subscribe(x => console.log("closeOrCancelOrder", x));
newOrder.subscribe(x => console.log("newOrder", x));

bullishMatches.next(1);
bullishMatches.next(2);
bearishMatches.next(3);
bullishMatches.next(4);
bearishMatches.next(5);
bearishMatches.next(6);
bullishMatches.next(7);
bearishMatches.next(8);
