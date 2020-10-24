import { ProtoOACtidTraderAccount } from "@claasahl/spotware-protobuf";
import { Server, Socket } from "net";
import debug from "debug";
import {
  SpotwareSocket,
  ProtoOAPayloadType,
  FACTORY,
} from "@claasahl/spotware-adapter";

import { STORE } from "./store";

const log = debug("custom-server");

const port = Number(process.env.port);
const server = new Server(serve);
server.listen(port, () => log(`listening on port ${port}`));

function serve(socket: Socket): void {
  log("new connection");
  const s = new SpotwareSocket(socket);
  s.on("error", log);
  s.on("data", (message) => {
    const { clientMsgId } = message;
    switch (message.payloadType) {
      case ProtoOAPayloadType.PROTO_OA_VERSION_REQ:
        {
          s.write(FACTORY.PROTO_OA_VERSION_RES({ version: "00" }, clientMsgId));
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_APPLICATION_AUTH_REQ:
        {
          s.write(FACTORY.PROTO_OA_APPLICATION_AUTH_RES({}, clientMsgId));
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_REQ:
        {
          const { accessToken } = message.payload;
          const ctidTraderAccount: ProtoOACtidTraderAccount[] = [];
          for (const key in STORE) {
            const entry = STORE[key];
            if (entry.accessTokens.length === 0) {
              entry.accessTokens.push(accessToken);
              ctidTraderAccount.push(entry.account);
            } else if (entry.accessTokens.includes(accessToken)) {
              ctidTraderAccount.push(entry.account);
            }
          }
          s.write(
            FACTORY.PROTO_OA_GET_ACCOUNTS_BY_ACCESS_TOKEN_RES(
              { accessToken, ctidTraderAccount },
              clientMsgId
            )
          );
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_ACCOUNT_AUTH_REQ:
        {
          const { ctidTraderAccountId, accessToken } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry && entry.accessTokens.includes(accessToken)) {
            s.write(
              FACTORY.PROTO_OA_ACCOUNT_AUTH_RES(
                { ctidTraderAccountId },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E1" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_TRADER_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_TRADER_RES(
                { ctidTraderAccountId, trader: entry.trader },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E2" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_ASSET_CLASS_LIST_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_ASSET_CLASS_LIST_RES(
                { ctidTraderAccountId, assetClass: entry.assetClasses },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E3" }, clientMsgId)
            );
          }
        }
        break;
      case ProtoOAPayloadType.PROTO_OA_SYMBOL_CATEGORY_REQ:
        {
          const { ctidTraderAccountId } = message.payload;
          const entry = STORE[ctidTraderAccountId];
          if (entry) {
            s.write(
              FACTORY.PROTO_OA_SYMBOL_CATEGORY_RES(
                { ctidTraderAccountId, symbolCategory: entry.categories },
                clientMsgId
              )
            );
          } else {
            s.write(
              FACTORY.PROTO_OA_ERROR_RES({ errorCode: "E4" }, clientMsgId)
            );
          }
        }
        break;
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
