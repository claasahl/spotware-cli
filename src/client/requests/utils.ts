import { ProtoErrorRes, ProtoOAErrorRes } from "@claasahl/spotware-adapter";

export function error(message: ProtoErrorRes | ProtoOAErrorRes): Error {
  const parts: string[] = [];
  if (message.description) {
    parts.push(`${message.errorCode}: ${message.description}`);
  } else {
    parts.push(message.errorCode);
  }
  if (message.maintenanceEndTimestamp) {
    const date = new Date(message.maintenanceEndTimestamp);
    parts.push(`(end of maintenance: ${date.toISOString()})`);
  }
  if ("ctidTraderAccountId" in message && message.ctidTraderAccountId) {
    parts.push(`(account: ${message.ctidTraderAccountId})`);
  }
  return new Error(parts.join(" "));
}
