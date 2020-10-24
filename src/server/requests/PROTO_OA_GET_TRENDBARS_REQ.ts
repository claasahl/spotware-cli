import {
  FACTORY,
  Messages,
  ProtoOAPayloadType,
  ProtoOATrendbar,
  SpotwareSocket,
} from "@claasahl/spotware-adapter";

import { STORE } from "../store";
import * as U from "./utils";

const response = U.response(FACTORY.PROTO_OA_GET_TRENDBARS_RES);

export function request(socket: SpotwareSocket) {
  return (message: Messages) => {
    if (message.payloadType === ProtoOAPayloadType.PROTO_OA_GET_TRENDBARS_REQ) {
      const { clientMsgId } = message;
      const { ctidTraderAccountId, symbolId, period } = message.payload;
      const entry = STORE[ctidTraderAccountId];
      if (!entry) {
        U.NOT_AUTHORIZED(socket, ctidTraderAccountId, clientMsgId);
        return;
      }

      const timestamp = 1603144800000;
      const trendbar: ProtoOATrendbar[] = [
        {
          volume: 2025,
          low: 117088,
          deltaOpen: 30,
          deltaClose: 60,
          deltaHigh: 84,
          utcTimestampInMinutes: 26697480,
        },
        {
          volume: 2254,
          low: 117129,
          deltaOpen: 19,
          deltaClose: 66,
          deltaHigh: 73,
          utcTimestampInMinutes: 26697540,
        },
        {
          volume: 4307,
          low: 117177,
          deltaOpen: 20,
          deltaClose: 74,
          deltaHigh: 112,
          utcTimestampInMinutes: 26697600,
        },
        {
          volume: 3914,
          low: 117213,
          deltaOpen: 39,
          deltaClose: 128,
          deltaHigh: 145,
          utcTimestampInMinutes: 26697660,
        },
        {
          volume: 2526,
          low: 117297,
          deltaOpen: 44,
          deltaClose: 24,
          deltaHigh: 55,
          utcTimestampInMinutes: 26697720,
        },
      ];
      response(
        socket,
        { ctidTraderAccountId, period, timestamp, trendbar, symbolId },
        clientMsgId
      );
    }
  };
}
