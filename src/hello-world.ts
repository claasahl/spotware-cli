import inquirer from "inquirer";
import {
  connect,
  fromProtoMessage,
  toProtoMessage,
  writeProtoMessage
} from "@claasahl/spotware-adapter";

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
  console.log(JSON.stringify(options, null, 2));
  // establish connection
  const client = connect(
    options.port,
    options.host
  );

  // handle proto messages
  client.on("PROTO_MESSAGE", (message, payloadType) => {
    const msg = fromProtoMessage(payloadType as any, message);
    const data = JSON.stringify({ payloadType, ...msg }, null, 2);
    console.log(data);
  });

  // write proto messages
  const heartbeats = setInterval(() => {
    const message = toProtoMessage("HEARTBEAT_EVENT", {});
    writeProtoMessage(client, message);
  }, 10000);
  client.on("end", () => clearInterval(heartbeats));

  writeProtoMessage(client, toProtoMessage("PROTO_OA_VERSION_REQ", {}));
}
