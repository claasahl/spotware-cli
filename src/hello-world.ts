import inquirer from "inquirer";
import {
  connect,
  fromProtoMessage,
  toProtoMessage,
  writeProtoMessage,
  SpotwareSocket
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
    },
    {
      type: "input",
      name: "clientId",
      message: "Enter OAuth 'clientId'",
      when: () => typeof process.env.SPOTWARE__CLIENT_ID === "undefined"
    },
    {
      type: "input",
      name: "clientSecret",
      message: "Enter OAuth 'clientSecret'",
      when: () => typeof process.env.SPOTWARE__CLIENT_SECRET === "undefined"
    }
  ])
  .then(startupClient);

const ui = new inquirer.ui.BottomBar();

interface StartupOptions {
  host: string;
  port: number;
  clientId: string;
  clientSecret: string;
}

function startupClient(options: StartupOptions) {
  const client = connect(
    options.port,
    options.host
  );
  printProtoMessages(client);
  scheduleHeartbeats(client);
  client.on("end", () => ui.close());

  writeProtoMessage(client, toProtoMessage("PROTO_OA_VERSION_REQ", {}));
  const {
    clientId = process.env.SPOTWARE__CLIENT_ID || "",
    clientSecret = process.env.SPOTWARE__CLIENT_SECRET || ""
  } = options;
  writeProtoMessage(
    client,
    toProtoMessage("PROTO_OA_APPLICATION_AUTH_REQ", { clientId, clientSecret })
  );
}

function printProtoMessages(client: SpotwareSocket) {
  client.on("PROTO_MESSAGE", (message, payloadType) => {
    const msg = fromProtoMessage(payloadType as any, message);
    const data = JSON.stringify({ payloadType, ...msg }, null, 2);
    ui.writeLog(data);
  });
}

function scheduleHeartbeats(client: SpotwareSocket): void {
  const heartbeats = setInterval(() => {
    const message = toProtoMessage("HEARTBEAT_EVENT", {});
    writeProtoMessage(client, message);
  }, 10000);
  client.on("end", () => clearInterval(heartbeats));
}
