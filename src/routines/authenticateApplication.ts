import * as $ from "@claasahl/spotware-adapter";
import { Observable, of } from "rxjs";

import util from "../util";

export function authenticateApplication(
  payload: $.ProtoOAApplicationAuthReq
): Observable<$.ProtoMessage2100> {
  return of(util.applicationAuth(payload));
}
