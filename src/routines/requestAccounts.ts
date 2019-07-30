import * as $ from "@claasahl/spotware-adapter";
import { OperatorFunction, of } from "rxjs";
import { flatMap } from "rxjs/operators";

import util from "../util";

export function requestAccounts(
  payload: $.ProtoOAGetAccountListByAccessTokenReq
): OperatorFunction<$.ProtoMessage2101, $.ProtoMessage2149> {
  return flatMap(() => of(util.getAccountsByAccessToken(payload)));
}
