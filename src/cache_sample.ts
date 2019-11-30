import { defer, of } from "rxjs";
import { publishReplay, refCount, take, delay, tap } from "rxjs/operators";

var updateRequest = defer(() => makeMockHttpRequest()).pipe(
  publishReplay(1, 1000),
  refCount(),
  take(1)
);

var counter = 1;
function makeMockHttpRequest() {
  return of(counter++).pipe(delay(100), tap(console.log));
}

function requestCachedHttpResult() {
  return updateRequest;
}

requestCachedHttpResult().subscribe(a => console.log("--->", a));
setTimeout(
  () => requestCachedHttpResult().subscribe(a => console.log("--->", a)),
  100
);
setTimeout(
  () => requestCachedHttpResult().subscribe(a => console.log("--->", a)),
  800
);
setTimeout(
  () => requestCachedHttpResult().subscribe(a => console.log("--->", a)),
  1200
);
setTimeout(
  () => requestCachedHttpResult().subscribe(a => console.log("--->", a)),
  2000
);
setTimeout(
  () => requestCachedHttpResult().subscribe(a => console.log("--->", a)),
  2500
);
