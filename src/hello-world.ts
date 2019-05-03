import inquirer from "inquirer";
import {
  connect,
  fromProtoMessage,
  toProtoMessage,
  writeProtoMessage,
  SpotwareSocket
} from "@claasahl/spotware-adapter";
import {
  IProtoMessage,
  ProtoPayloadType
} from "@claasahl/spotware-adapter/build/spotware-messages";
import SpotwarePayloadTypes from "@claasahl/spotware-adapter/build/spotware-payload-types";

inquirer
  .prompt<StartupOptions>([
    {
      type: "list",
      name: "host",
      message: "To which host do you want to connect?",
      choices: ["demo.ctraderapi.com", "live.ctraderapi.com"],
      default: "live.ctraderapi.com"
    },
    {
      type: "number",
      name: "port",
      message: "Which port should be connected to?",
      validate: (value: number) => {
        if (value > 0 && value < 65536) {
          return true;
        }
        return "Please enter a valid port number";
      },
      default: "5035"
    }
  ])
  .then(startupClient);

interface StartupOptions {
  host: string;
  port: number;
}

function startupClient(options: StartupOptions) {
  const client = connect(
    options.port,
    options.host
  );
  printProtoMessages(client);
  scheduleHeartbeats(client);

  writeProtoMessage(client, toProtoMessage("PROTO_OA_VERSION_REQ", {}));
}

function printProtoMessages(client: SpotwareSocket) {
  client.on("PROTO_MESSAGE", (message, payloadType) => {
    const msg = fromProtoMessage(payloadType as any, message);
    const data = JSON.stringify({ payloadType, ...msg }, null, 2);
    console.log(data);
  });
}

function scheduleHeartbeats(client: SpotwareSocket): void {
  const heartbeats = setInterval(() => {
    const message = toProtoMessage("HEARTBEAT_EVENT", {});
    writeProtoMessage(client, message);
  }, 10000);
  client.on("end", () => clearInterval(heartbeats));
}
