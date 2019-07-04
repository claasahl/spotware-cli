import { Schema, Enum, Message } from "protocol-buffers-schema/types";
import { EOL } from "os";
import fs from "fs";
import resolve from "resolve-protobuf-schema";

const schema = resolve.sync("./protobuf/OpenApiCommonMessages.proto");
fs.writeFileSync("./src/OpenApiCommonMessages.ts", compile(schema));

export function compile(schema: Schema): string {
  const lines: string[] = ['import PBF from "pbf";', ""];
  schema.enums.map(compileEnum).forEach(code => lines.push(...code));
  schema.messages.map(compileMessage).forEach(code => lines.push(...code));
  return lines.join(EOL);
}

function compileEnum(protoEnum: Enum): string[] {
  const lines: string[] = [];
  lines.push(`export enum ${protoEnum.name} {`);
  Object.entries(protoEnum.values).forEach(([name, data]) => {
    lines.push(`  ${name} = ${data.value},`);
  });
  lines.push("}", "");
  return lines;
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
  lines.push(`export interface I${protoMessage.name} {`);
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
  lines.push(`export class ${protoMessage.name} {`);
  lines.push(...compileReadMethod(protoMessage));
  lines.push(...compileWriteMethod(protoMessage));
  lines.push("}", "");
  return lines;
}

function compileReadMethod(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push("  static read(pbf: PBF, end?: number) {");
  lines.push("    return pbf.readFields(");
  lines.push(`      ${protoMessage.name}._readField,`, "      {");
  protoMessage.fields
    .filter(field => field.required)
    .forEach(field =>
      lines.push(`      ${field.name}: ${defaultValue(field.type)}`)
    );
  lines.push("      },", "      end", "    );");
  lines.push("  }", "");

  lines.push(
    `  private static _readField(tag: number, obj: I${protoMessage.name}, pbf: PBF) {`
  );
  protoMessage.fields.forEach(field =>
    lines.push(
      `    if (tag === ${field.tag}) obj.${field.name} = pbf.${mapReadMethod(
        field.type
      )}();`
    )
  );
  lines.push("  }", "");
  return lines;
}

function compileWriteMethod(protoMessage: Message): string[] {
  const lines: string[] = [];
  lines.push(`  static write(obj: I${protoMessage.name}, pbf: PBF) {`);
  protoMessage.fields.forEach(field =>
    lines.push(
      `    if (obj.${field.name}) pbf.${mapWriteMethod(field.type)}(${
        field.tag
      }, obj.${field.name});`
    )
  );
  lines.push("  }", "");
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

function mapWriteMethod(type: string): string {
  switch (type) {
    case "bytes":
      return "writeBytesField";
    case "fixed32":
      return "writeFixed32Field";
    case "sfixed32":
      return "writeSFixed32Field";
    case "fixed64":
      return "writeFixed64Field";
    case "sfixed64":
      return "writeSFixed64Field";
    case "uint32":
    case "uint64":
      return "writeVarintField";
    case "sint32":
    case "sint64":
      return "writeSVarintField";
    case "string":
      return "writeStringField";
    case "float":
      return "writeFloatField";
    case "double":
      return "writeDoubleField";
    case "bool":
      return "writeBooleanField";
    default:
      return "writeVarintField";
    //return `no mapping for '${type}'`
  }
}
function mapReadMethod(type: string): string {
  switch (type) {
    case "bytes":
      return "readBytes";
    case "fixed32":
      return "readFixed32";
    case "sfixed32":
      return "readSFixed32";
    case "fixed64":
      return "readFixed64";
    case "sfixed64":
      return "readSFixed64";
    case "uint32":
      return "readVarint";
    case "uint64":
      return "readVarint64";
    case "sint32":
    case "sint64":
      return "readSVarint";
    case "string":
      return "readString";
    case "float":
      return "readFloat";
    case "double":
      return "readDouble";
    case "bool":
      return "readBoolean";
    default:
      return "readVarint";
    //return `no mapping for '${type}'`
  }
}

function defaultValue(type: string): string {
  switch (type) {
    case "bytes":
      return "Buffer.alloc(0)";
    case "fixed32":
      return "readFixed32";
    case "sfixed32":
      return "readSFixed32";
    case "fixed64":
      return "readFixed64";
    case "sfixed64":
      return "readSFixed64";
    case "uint32":
      return "0";
    case "uint64":
      return "readVarint64";
    case "sint32":
    case "sint64":
      return "readSVarint";
    case "string":
      return '""';
    case "float":
      return "readFloat";
    case "double":
      return "readDouble";
    case "bool":
      return "readBoolean";
    default:
      return `no default value for '${type}'`;
  }
}
