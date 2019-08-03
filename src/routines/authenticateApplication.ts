import * as $ from "@claasahl/spotware-adapter";
import { Observable, of } from "rxjs";

import { pm2100 } from "../utils";

export function authenticateApplication(
  payload: $.ProtoOAApplicationAuthReq
): Observable<$.ProtoMessage2100> {
  return of(pm2100(payload));
}
