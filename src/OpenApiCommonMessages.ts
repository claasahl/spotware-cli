import PBF from "pbf";

enum ProtoPayloadType {
  "PROTO_MESSAGE" = 5,
  "ERROR_RES" = 50,
  "HEARTBEAT_EVENT" = 51
}

enum ProtoErrorCode {
  "UNKNOWN_ERROR" = 1,
  "UNSUPPORTED_MESSAGE" = 2,
  "INVALID_REQUEST" = 3,
  "WRONG_PASSWORD" = 4,
  "TIMEOUT_ERROR" = 5,
  "ENTITY_NOT_FOUND" = 6,
  "CANT_ROUTE_REQUEST" = 7,
  "FRAME_TOO_LONG" = 8,
  "MARKET_CLOSED" = 9,
  "CONCURRENT_MODIFICATION" = 10,
  "BLOCKED_PAYLOAD_TYPE" = 11
}

// ProtoMessage ========================================

export interface IProtoMessage {
  payloadType: ProtoPayloadType;
  payload: Uint8Array | null | undefined;
  clientMsgId: string | null | undefined;
}
export class ProtoMessage {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoMessage._readField,
      { payloadType: 0, payload: null, clientMsgId: "" },
      end
    );
  }
  private static _readField(tag: number, obj: IProtoMessage, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    else if (tag === 2) obj.payload = pbf.readBytes();
    else if (tag === 3) obj.clientMsgId = pbf.readString();
  }
  static write(obj: IProtoMessage, pbf: PBF) {
    if (obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (obj.payload) pbf.writeBytesField(2, obj.payload);
    if (obj.clientMsgId) pbf.writeStringField(3, obj.clientMsgId);
  }
}

// ProtoErrorRes ========================================

export interface IProtoErrorRes {
  payloadType?: ProtoPayloadType;
  errorCode: string;
  description?: string;
  maintenanceEndTimestamp?: number;
}

export class ProtoErrorRes {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoErrorRes._readField,
      {
        payloadType: ProtoPayloadType.ERROR_RES,
        errorCode: "",
        description: "",
        maintenanceEndTimestamp: 0
      },
      end
    );
  }
  private static _readField(tag: number, obj: IProtoErrorRes, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
    else if (tag === 2) obj.errorCode = pbf.readString();
    else if (tag === 3) obj.description = pbf.readString();
    else if (tag === 4) obj.maintenanceEndTimestamp = pbf.readVarint();
  }
  static write(obj: IProtoErrorRes, pbf: PBF) {
    if (obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
    if (obj.errorCode) pbf.writeStringField(2, obj.errorCode);
    if (obj.description) pbf.writeStringField(3, obj.description);
    if (obj.maintenanceEndTimestamp)
      pbf.writeVarintField(4, obj.maintenanceEndTimestamp);
  }
}

// ProtoHeartbeatEvent ========================================

export interface IProtoHeartbeatEvent {
  payloadType?: ProtoPayloadType;
}

export class ProtoHeartbeatEvent {
  static read(pbf: PBF, end?: number) {
    return pbf.readFields(
      ProtoHeartbeatEvent._readField,
      { payloadType: ProtoPayloadType.HEARTBEAT_EVENT },
      end
    );
  }
  private static _readField(tag: number, obj: IProtoHeartbeatEvent, pbf: PBF) {
    if (tag === 1) obj.payloadType = pbf.readVarint();
  }
  static write(obj: IProtoHeartbeatEvent, pbf: PBF) {
    if (obj.payloadType) pbf.writeVarintField(1, obj.payloadType);
  }
}
