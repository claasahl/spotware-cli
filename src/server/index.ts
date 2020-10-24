import { ProtoOACtidTraderAccount } from "@claasahl/spotware-protobuf";
import { Server, Socket } from "net";
import debug from "debug";
import {
  SpotwareSocket,
  ProtoOAPayloadType,
  FACTORY,
} from "@claasahl/spotware-adapter";

import { STORE } from "./store";
import { requests } from "./requests";

const log = debug("custom-server");

const port = Number(process.env.port);
const server = new Server(serve);
server.listen(port, () => log(`listening on port ${port}`));

function serve(socket: Socket): void {
  log("new connection");
  const s = new SpotwareSocket(socket);
  const dealWithIt = requests(s);
  s.on("error", log);
  s.on("data", dealWithIt);
  s.on("data", (message) => {
    const { clientMsgId } = message;
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_SYMBOLS_LIST_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_SYMBOLS_LIST_RES(
                {
                  ctidTraderAccountId,
                  archivedSymbol: [],
                  symbol: entry.symbols,
                },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E5" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_SYMBOL_BY_ID_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_SYMBOL_BY_ID_RES(
                {
                  ctidTraderAccountId,
                  archivedSymbol: [],
                  symbol: entry.symbols,
                },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E9" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_SUBSCRIBE_SPOTS_REQ:
        {
          const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            const alreadySubscribed = symbolIds
              .map((id) => !!entry.subscriptions[id])
              .find((p) => p);
            if (alreadySubscribed) {
              s.write(
                FACTORY.PROTO_OA_ERROR_RES(
                  {
                    errorCode: "E6 - only one subscription per symbol allowed",
                  },
                  clientMsgId
                )
              );
              break;
            }
            s.write(
              FACTORY.PROTO_OA_SUBSCRIBE_SPOTS_RES(
                { ctidTraderAccountId },
                clientMsgId
              )
            );

            for (const symbolId of symbolIds) {
              const timer = setInterval(() => {
                s.write(
                  FACTORY.PROTO_OA_SPOT_EVENT(
                    { ctidTraderAccountId, symbolId, trendbar: [] },
                    clientMsgId
                  )
                );
              }, 1000);
              entry.subscriptions[symbolId] = timer;
            }
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E6" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_UNSUBSCRIBE_SPOTS_REQ:
        {
          const { ctidTraderAccountId, symbolId: symbolIds } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            const alreadyUnsubscribed = symbolIds
              .map((id) => !entry.subscriptions[id])
              .find((p) => p);
            if (alreadyUnsubscribed) {
              s.write(
                FACTORY.PROTO_OA_ERROR_RES(
                  { errorCode: "E7 - no subscription" },
                  clientMsgId
                )
              );
              break;
            }
            s.write(
              FACTORY.PROTO_OA_UNSUBSCRIBE_SPOTS_RES(
                { ctidTraderAccountId },
                clientMsgId
              )
            );

            for (const symbolId of symbolIds) {
              clearInterval(entry.subscriptions[symbolId]);
              delete entry.subscriptions[symbolId];
            }
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E7" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_GET_TICKDATA_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_GET_TICKDATA_RES(
                { ctidTraderAccountId, hasMore: false, tickData: [] },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E8" }, clientMsgId)
            );
          }
        }
        break;
    }
  });
}
