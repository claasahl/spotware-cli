import inquirer from "inquirer";
import {
  connect,
  fromProtoMessage,
  toProtoMessage,
  writeProtoMessage
} from "@claasahl/spotware-adapter";

const questions: inquirer.Questions<any> = [
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
];

inquirer.prompt(questions).then(answers => {
  console.log(JSON.stringify(answers, null, "  "));
  // establish connection
  const client = connect(
    answers.port,
    answers.host
  );

  // handle (incoming) proto messages
  client.on("PROTO_MESSAGE", (message, payloadType) => {
    const msg = fromProtoMessage(payloadType as any, message);
    const data = JSON.stringify({ payloadType, ...msg }, null, 2);
    console.log(data);
  });

  // write (outgoing) proto messages
  const heartbeats = setInterval(() => {
    const message = toProtoMessage("HEARTBEAT_EVENT", {});
    writeProtoMessage(client, message);
  }, 10000);
  client.on("end", () => clearInterval(heartbeats));

  writeProtoMessage(client, toProtoMessage("PROTO_OA_VERSION_REQ", {}));
});
