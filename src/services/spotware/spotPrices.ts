import * as $ from "@claasahl/spotware-adapter";
import { SpotPricesStream, DebugSpotPricesStream, SpotPricesProps } from "../base";


export function fromSocket(props: SpotPricesProps & { socket: $.SpotwareSocket, symbolId: number }): SpotPricesStream {
    const { socket, symbolId } = props;
    const stream = new DebugSpotPricesStream(props);
    socket.on("PROTO_MESSAGE.INPUT.*", msg => {
        function isSpotPriceEvent(msg: $.ProtoMessages): msg is $.ProtoMessage2131 {
            return msg.payloadType === $.ProtoOAPayloadType.PROTO_OA_SPOT_EVENT;
        }
        if (isSpotPriceEvent(msg) && msg.payload.symbolId === symbolId) {
            const timestamp = Date.now();
            if (msg.payload.ask) {
                const ask = msg.payload.ask;
                stream.emitAsk({ timestamp, ask });
            }
            if (msg.payload.bid) {
                const bid = msg.payload.bid;
                stream.emitBid({ timestamp, bid });
            }
            if (msg.payload.ask && msg.payload.bid) {
                const {ask, bid} = msg.payload;
                stream.emitPrice({ timestamp, ask, bid });
            }
        }
    });
    return stream;
}