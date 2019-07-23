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
      `  ${field.name}${field.required || field.repeated ? "" : "?"}: ${mapType(
        field
      )},`
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
    .filter(field => field.required || field.repeated)
    .forEach(field =>
      lines.push(`      ${field.name}: ${defaultValue(field)},`)
    );
  lines.push("      },", "      end", "    );");
  lines.push("  }", "");

  lines.push(
    `private static _readField(tag: number, obj: ${protoMessage.name}, pbf: PBF) {`
  );
  protoMessage.fields.forEach(field =>
    lines.push(`if (tag === ${field.tag}) ${mapReadMethod(field)};`)
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

function mapType(field: Field): string {
  switch (field.type) {
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
      return field.repeated ? "number[]" : "number";
    case "bytes":
      return "Uint8Array";
    default:
      return field.repeated ? `${field.type}[]` : field.type;
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
      if (field.options.packed) {
        return `pbf.writePackedVarint(${field.tag}, obj.${field.name})`;
      }
      return field.repeated
        ? `obj.${field.name}.forEach(${field.name} =>pbf.writeVarintField(${field.tag}, ${field.name}))`
        : `pbf.writeVarintField(${field.tag}, obj.${field.name})`;
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
      return field.repeated
        ? `obj.${field.name}.forEach(${field.name} => pbf.writeMessage(${field.tag}, ${field.type}Utils.write, ${field.name}))`
        : `pbf.writeMessage(${field.tag}, ${field.type}Utils.write, obj.${field.name})`;
    //return `no mapping for '${type}'`
  }
}
function mapReadMethod(field: Field): string {
  if (enums.has(field.type)) {
    return `obj.${field.name} = pbf.readVarint()`;
  }
  switch (field.type) {
    case "bytes":
      return `obj.${field.name} = pbf.readBytes()`;
    case "fixed32":
      return `obj.${field.name} = pbf.readFixed32()`;
    case "sfixed32":
      return `obj.${field.name} = pbf.readSFixed32()`;
    case "fixed64":
      return `obj.${field.name} = pbf.readFixed64()`;
    case "sfixed64":
      return `obj.${field.name} = pbf.readSFixed64()`;
    case "uint32":
    case "int32":
      return `obj.${field.name} = pbf.readVarint()`;
    case "uint64":
    case "int64":
      if (field.options.packed) {
        return `pbf.readPackedVarint(obj.${field.name})`;
      }
      return field.repeated
        ? `obj.${field.name}.push(pbf.readVarint64())`
        : `obj.${field.name} = pbf.readVarint64()`;
    case "sint32":
    case "sint64":
      return `obj.${field.name} = pbf.readSVarint()`;
    case "string":
      return `obj.${field.name} = pbf.readString()`;
    case "float":
      return `obj.${field.name} = pbf.readFloat()`;
    case "double":
      return `obj.${field.name} = pbf.readDouble()`;
    case "bool":
      return `obj.${field.name} = pbf.readBoolean()`;
    default:
      return field.repeated
        ? `obj.${field.name}.push(${field.type}Utils.read(pbf, pbf.readVarint() + pbf.pos))`
        : `obj.${field.name} = ${field.type}Utils.read(pbf, pbf.readVarint() + pbf.pos)`;
    //return "pbf.readVarint()";
    //return `no mapping for '${type}'`
  }
}

function defaultValue(field: Field): string {
  if (field.repeated) {
    return "[]";
  }
  switch (field.type) {
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
      return `no default value for '${field.type}'`;
  }
}
