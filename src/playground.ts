import { fromEvent, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import {
  connect,
  ProtoMessages,
  write,
  ProtoOAPayloadType
} from "@claasahl/spotware-adapter";

import CONFIG from "./config";

const { host, port, clientId, clientSecret } = CONFIG;

const socket = connect(
  port,
  host
);
const inputProtoMessages = fromEvent<ProtoMessages>(socket, "PROTO_MESSAGE.*");
inputProtoMessages
  .pipe(tap(message => console.log(JSON.stringify(message))))
  .subscribe();

const outputProtoMessages = new Subject<ProtoMessages>();
outputProtoMessages.pipe(tap(message => write(socket, message))).subscribe();

outputProtoMessages.next({
  payloadType: ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ,
  payload: { clientId, clientSecret }
});
