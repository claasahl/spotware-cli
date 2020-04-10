import * as $ from "@claasahl/spotware-adapter"
import debug from "debug"

interface Publisher {
  publish: (msg: $.ProtoMessages) => void,
  done: () => void
}

function publisher(socket: $.SpotwareSocket): Publisher {
  const messages: $.ProtoMessages[] = [];
  function publish() {
    setImmediate(() => {
      const msg = messages.shift();
      if (msg) {
        $.write(socket, msg);
      }
    });
  }
  const publisher: NodeJS.Timeout = setInterval(publish, 300)
  return {
    publish: (msg: $.ProtoMessages) => messages.push(msg),
    done: () => clearInterval(publisher)
  }
}

function pacemaker(socket: $.SpotwareSocket, publisher: Publisher) {
  const heartbeat: $.ProtoMessages = { payloadType: $.ProtoPayloadType.HEARTBEAT_EVENT, payload: {} }
  let pacemaker: NodeJS.Timeout | null = setTimeout(() => publisher.publish(heartbeat), 10000);
  socket.on("PROTO_MESSAGE.OUTPUT.*", () => {
    if (pacemaker) {
      clearTimeout(pacemaker);
    }
    pacemaker = setTimeout(() => publisher.publish(heartbeat), 10000);
  });
}

function clientMsgId(): string {
  return new Date().toISOString();
}

function isError(msg: $.ProtoMessages): msg is $.ProtoMessage50 {
  return msg.payloadType === $.ProtoPayloadType.ERROR_RES;
}

function isOAError(msg: $.ProtoMessages): msg is $.ProtoMessage2142 {
  return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_ERROR_RES;
}

function request<REQ extends $.ProtoMessages, RES extends $.ProtoMessages>(
  socket: $.SpotwareSocket, publisher: Publisher,
  request: REQ,
  payloadType: $.ProtoOAPayloadType | $.ProtoPayloadType,
  event: string
) {
  const msgId = clientMsgId();
  setImmediate(() => publisher.publish({ ...request, clientMsgId: msgId }));
  function isResponse(msg: $.ProtoMessages): msg is RES {
    return msg.payloadType === payloadType;
  }
  function response(msg: $.ProtoMessages) {
    if (msg.clientMsgId === msgId && isResponse(msg)) {
      setImmediate(() => socket.emit(event, msg));
      socket.off("PROTO_MESSAGE.INPUT.*", response);
    } else if (msg.clientMsgId === msgId && (isError(msg) || isOAError(msg))) {
      const { errorCode, description } = msg.payload;
      setImmediate(() =>
        socket.emit("error", new Error(`${errorCode}, ${description}`))
      );
      socket.off("PROTO_MESSAGE.INPUT.*", response);
    }
  }
  socket.on("PROTO_MESSAGE.INPUT.*", response);
}

function authApplication(socket: $.SpotwareSocket, publisher: Publisher, payload: $.ProtoOAApplicationAuthReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_RES;
  request(
    socket, publisher,
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "authApplication"
  );
}

function lookupAccounts(socket: $.SpotwareSocket, publisher: Publisher, payload: $.ProtoOAGetAccountListByAccessTokenReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES;
  request(
    socket, publisher,
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "lookupAccounts"
  );
}

function authAccount(socket: $.SpotwareSocket, publisher: Publisher, payload: $.ProtoOAAccountAuthReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_RES;
  request(
    socket, publisher,
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "authAccount"
  );
}

function version(socket: $.SpotwareSocket, publisher: Publisher, payload: $.ProtoOAVersionReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_VERSION_RES;
  request(
    socket, publisher,
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "version"
  );
}

function symbolsList(socket: $.SpotwareSocket, publisher: Publisher, payload: $.ProtoOASymbolsListReq) {
  const requestPayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ;
  const responsePayloadType = $.ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_RES;
  request(
    socket, publisher,
    { payloadType: requestPayloadType, payload },
    responsePayloadType,
    "symbolsList"
  );
}


interface SockProps {
  port: number;
  host: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
}
export interface Result {
  socket: $.SpotwareSocket,
  ctidTraderAccountId: number | null,
  symbols: Map<string, $.ProtoOALightSymbol>
}
export function sock(props: SockProps): Result {
  const log = debug("spotware");
  const input = log.extend("input");
  const output = log.extend("output");
  const error = log.extend("error");

  const S = $.connect(props.port, props.host);
  const P = publisher(S);
  const result: Result = {
    socket: S,
    ctidTraderAccountId: null,
    symbols: new Map()
  }
  S.on("connect", () => log("connected"));
  S.on("connect", () => pacemaker(S, P));
  S.on("connect", () => authApplication(S, P, props));
  S.on("close", () => log("disconnect"));
  S.on("error", (err: Error) => error(err.message));
  S.on("PROTO_MESSAGE.INPUT.*", msg => input("%j", msg));
  S.on("PROTO_MESSAGE.OUTPUT.*", msg => output("%j", msg));

  S.on("authApplication", () => version(S, P, {}))
  S.on("authApplication", () => lookupAccounts(S, P, props))
  S.on("lookupAccounts", (msg: $.ProtoMessage2150) => {
    result.ctidTraderAccountId = msg.payload.ctidTraderAccount[0].ctidTraderAccountId;
    authAccount(S, P, {...props, ctidTraderAccountId: result.ctidTraderAccountId })
  })
  S.on("authAccount", () => symbolsList(S, P, {ctidTraderAccountId: result.ctidTraderAccountId!}))
  S.on("symbolsList", (msg: $.ProtoMessage2115) => {
    msg.payload.symbol.forEach(s => result.symbols.set(s.symbolName || "", s))
  });
  return result;
}
