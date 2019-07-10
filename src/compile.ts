import { Schema, Message, Field } from "protocol-buffers-schema/types";
import { EOL } from "os";
import fs from "fs";
import resolve from "resolve-protobuf-schema";

import compileEnum from "./compileEnum";

const enums: Set<string> = new Set();

fs.writeFileSync(
  "./src/OpenApiCommonMessages.ts",
  compile(resolve.sync("./protobuf/OpenApiCommonMessages.proto"))
);
fs.writeFileSync(
  "./src/OpenApiMessages.ts",
  compile(resolve.sync("./protobuf/OpenApiMessages.proto"))
);

export function compile(schema: Schema): string {
  const lines: string[] = ['import PBF from "pbf";', ""];
  schema.enums.map(entry => entry.name).forEach(a => enums.add(a));
  schema.enums.forEach(protoEnum =>
    lines.push(compileEnum(protoEnum, { type: "global" }))
  );
  schema.messages.map(compileMessage).forEach(code => lines.push(...code));
  return lines.join(EOL);
}

function compileMessage(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push(
    `// ${protoMessage.name} ${"=".repeat(60 - protoMessage.name.length)}`,
    ""
  );
  lines.push(...compileMessageInterface(protoMessage));
  lines.push(...compileMessageClass(protoMessage));
  return lines;
}

function compileMessageInterface(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push(`export interface ${protoMessage.name} {`);
  protoMessage.fields.forEach(field =>
    lines.push(
      `  ${field.name}${field.required ? "" : "?"}: ${mapType(field.type)},`
    )
  );
  lines.push("}", "");
  return lines;
}

function compileMessageClass(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push(`export class ${protoMessage.name}Utils {`);
  lines.push(...compileReadMethod(protoMessage));
  lines.push(...compileWriteMethod(protoMessage));
  lines.push("}", "");
  return lines;
}

function compileReadMethod(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push("  static read(pbf: PBF, end?: number) {");
  lines.push("    return pbf.readFields(");
  lines.push(`      ${protoMessage.name}Utils._readField,`, "      {");
  protoMessage.fields
    .filter(field => field.required)
    .forEach(field =>
      lines.push(`      ${field.name}: ${defaultValue(field.type)},`)
    );
  lines.push("      },", "      end", "    );");
  lines.push("  }", "");

  lines.push(
    `private static _readField(tag: number, obj: ${protoMessage.name}, pbf: PBF) {`
  );
  protoMessage.fields.forEach(field =>
    lines.push(
      `if (tag === ${field.tag}) obj.${field.name} = ${mapReadMethod(
        field.type
      )};`
    )
  );
  lines.push("}", "");
  return lines;
}

function compileWriteMethod(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push(`static write(obj: ${protoMessage.name}, pbf: PBF = new PBF()) {`);
  protoMessage.fields.forEach(field =>
    lines.push(`if (obj.${field.name}) ${mapWriteMethod(field)}`)
  );
  lines.push("}", "");
  return lines;
}

function mapType(type: string): string {
  switch (type) {
    case "string":
      return "string";
    case "bool":
      return "boolean";
    case "float":
    case "double":
    case "enum":
    case "uint32":
    case "uint64":
    case "int32":
    case "int64":
    case "sint32":
    case "sint64":
    case "fixed32":
    case "fixed64":
    case "sfixed32":
    case "sfixed64":
      return "number";
    case "bytes":
      return "Uint8Array";
    default:
      return type;
    //throw new Error("Unexpected type: " + type);
  }
}

function mapWriteMethod(field: Field): string {
  if (enums.has(field.type)) {
    return `pbf.writeVarintField(${field.tag}, obj.${field.name})`;
  }
  switch (field.type) {
    case "bytes":
      return `pbf.writeBytesField(${field.tag}, obj.${field.name})`;
    case "fixed32":
      return `pbf.writeFixed32Field(${field.tag}, obj.${field.name})`;
    case "sfixed32":
      return `pbf.writeSFixed32Field(${field.tag}, obj.${field.name})`;
    case "fixed64":
      return `pbf.writeFixed64Field(${field.tag}, obj.${field.name})`;
    case "sfixed64":
      return `pbf.writeSFixed64Field(${field.tag}, obj.${field.name})`;
    case "uint32":
    case "uint64":
    case "int32":
    case "int64":
      return `pbf.writeVarintField(${field.tag}, obj.${field.name})`;
    case "sint32":
    case "sint64":
      return `pbf.writeSVarintField(${field.tag}, obj.${field.name})`;
    case "string":
      return `pbf.writeStringField(${field.tag}, obj.${field.name})`;
    case "float":
      return `pbf.writeFloatField(${field.tag}, obj.${field.name})`;
    case "double":
      return `pbf.writeDoubleField(${field.tag}, obj.${field.name})`;
    case "bool":
      return `pbf.writeBooleanField(${field.tag}, obj.${field.name})`;
    default:
      return `pbf.writeMessage(${field.tag}, ${field.type}Utils.write, obj.${field.name})`;
    //return `no mapping for '${type}'`
  }
}
function mapReadMethod(type: string): string {
  if (enums.has(type)) {
    return "pbf.readVarint()";
  }
  switch (type) {
    case "bytes":
      return "pbf.readBytes()";
    case "fixed32":
      return "pbf.readFixed32()";
    case "sfixed32":
      return "pbf.readSFixed32()";
    case "fixed64":
      return "pbf.readFixed64()";
    case "sfixed64":
      return "pbf.readSFixed64()";
    case "uint32":
    case "int32":
      return "pbf.readVarint()";
    case "uint64":
    case "int64":
      return "pbf.readVarint64()";
    case "sint32":
    case "sint64":
      return "pbf.readSVarint()";
    case "string":
      return "pbf.readString()";
    case "float":
      return "pbf.readFloat()";
    case "double":
      return "pbf.readDouble()";
    case "bool":
      return "pbf.readBoolean()";
    default:
      return `${type}Utils.read(pbf, pbf.readVarint() + pbf.pos)`;
    //return "pbf.readVarint()";
    //return `no mapping for '${type}'`
  }
}

function defaultValue(type: string): string {
  switch (type) {
    case "bytes":
      return "Buffer.alloc(0)";
    case "fixed32":
    case "sfixed32":
    case "fixed64":
    case "sfixed64":
    case "int32":
    case "int64":
    case "uint32":
    case "uint64":
    case "sint32":
    case "sint64":
    case "float":
    case "double":
      return "0";
    case "string":
      return '""';
    case "bool":
      return "false";
    case "ProtoOAOrderType":
      return "ProtoOAOrderType.MARKET";
    case "ProtoOATradeSide":
      return "ProtoOATradeSide.BUY";
    case "ProtoOAExecutionType":
      return "ProtoOAExecutionType.ORDER_ACCEPTED";
    case "ProtoOATrader":
      return "{balance: 0, ctidTraderAccountId: 0, depositAssetId: 0}";
    case "ProtoOATrendbarPeriod":
      return "ProtoOATrendbarPeriod.M1";
    case "ProtoOAQuoteType":
      return "ProtoOAQuoteType.BID";
    case "ProtoOACtidProfile":
      return "{userId: 0}";
    case "ProtoOATradeData":
      return "{symbolId: 0, volume: 0, tradeSide: ProtoOATradeSide.BUY}";
    case "ProtoOAPositionStatus":
      return "ProtoOAPositionStatus.POSITION_STATUS_OPEN";
    case "ProtoOAOrderStatus":
      return "ProtoOAOrderStatus.ORDER_STATUS_ACCEPTED";
    case "ProtoOAChangeBonusType":
      return "ProtoOAChangeBonusType.BONUS_DEPOSIT";
    case "ProtoOAChangeBalanceType":
      return "ProtoOAChangeBalanceType.BALANCE_DEPOSIT";
    case "ProtoOADealStatus":
      return "ProtoOADealStatus.FILLED";
    default:
      return `no default value for '${type}'`;
  }
}
