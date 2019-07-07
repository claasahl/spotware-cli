import { Enum } from "protocol-buffers-schema/types";
import { EOL } from "os";
interface Context {
  type: "global" | "nested";
}
export default function compile(protoEnum: Enum, context: Context): string {
  const lines: string[] = [];
  lines.push(
    `${context.type === "global" && "export"} enum ${protoEnum.name} {`
  );
  Object.entries(protoEnum.values).forEach(([name, data]) => {
    lines.push(`  ${name} = ${data.value},`);
  });
  lines.push("}", "");
  return lines.join(EOL);
}
