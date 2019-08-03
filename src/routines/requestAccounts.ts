import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, of } from "rxjs";
import { flatMap } from "rxjs/operators";

import { pm2149 } from "../utils";

export function requestAccounts(
  payload: $.ProtoOAGetAccountListByAccessTokenReq
): OperatorFunction<$.ProtoMessage2101, $.ProtoMessage2149> {
  return flatMap(() => of(pm2149(payload)));
}
