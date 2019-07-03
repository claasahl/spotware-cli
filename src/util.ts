import Pbf from "pbf";

import { IProtoMessage, ProtoMessage } from "./OpenApiCommonMessages";

const INT_SIZE = 4;
function length(length: number): Buffer {
  const buffer = Buffer.alloc(INT_SIZE);
  buffer.writeInt32BE(length, 0);
  return buffer;
}

export function serialize(message: IProtoMessage): Buffer {
  const pbf = new Pbf(Buffer.alloc(128));
  ProtoMessage.write(message, pbf);
  const data = pbf.finish();
  const len = length(data.length);
  const totalLength = len.length + data.length;
  return Buffer.concat([len, data], totalLength);
}

export function deserialize(data: Buffer, offset: number = 0): IProtoMessage {
  const length = data.readInt32BE(offset);
  const remainingBytes = data.length - offset - INT_SIZE;
  if (remainingBytes >= length) {
    const payload = data.slice(offset + INT_SIZE, length + offset + INT_SIZE);
    const pbf = new Pbf(payload);
    return ProtoMessage.read(pbf);
  } else {
    throw new Error("buffer not large enough");
  }
}
