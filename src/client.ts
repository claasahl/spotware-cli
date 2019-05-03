import { SpotwareSocket, connect } from "@claasahl/spotware-adapter";
import inquirer from "inquirer";
import * as Rx from "rxjs";

interface Options {
  host: string;
  port: number;
  clientId: string;
  clientSecret: string;
}
interface State {
  client?: SpotwareSocket;
  options?: Options;
}
const state: State = {};

const mainMenu = {
  type: "list",
  name: "command",
  message: "What do you want to do?",
  choices: [
    {
      name: "connect to server",
      value: "connect",
      disabled: () =>
        typeof state.client === "object" ? "already connected" : undefined
    },
    {
      name: "disconnect from server",
      value: "disconnect",
      disabled: () =>
        typeof state.client === "undefined" ? "not connected" : undefined
    },
    new inquirer.Separator(),
    {
      name: "exit client",
      value: "exit",
      disabled: () =>
        typeof state.client === "object" ? "still connected" : undefined
    }
  ]
};

const connectHost = {
  type: "list",
  name: "host",
  message: "To which host do you want to connect?",
  choices: ["demo.ctraderapi.com", "live.ctraderapi.com"],
  default: "live.ctraderapi.com",
  when: () => typeof state.options === "undefined"
};
const connectPort = {
  type: "number",
  name: "port",
  message: "Which port should be connected to?",
  validate: (value: number) => {
    if (value > 0 && value < 65536) {
      return true;
    }
    return "Please enter a valid port number";
  },
  default: "5035",
  when: () => typeof state.options === "undefined"
};
const connectClientId = {
  type: "input",
  name: "clientId",
  message: "Enter OAuth 'clientId'",
  when: () => typeof process.env.SPOTWARE__CLIENT_ID === "undefined"
};
const connectClientSecret = {
  type: "input",
  name: "clientSecret",
  message: "Enter OAuth 'clientSecret'",
  when: () => typeof process.env.SPOTWARE__CLIENT_SECRET === "undefined"
};

const prompts = new Rx.Subject<inquirer.Question>();
inquirer.prompt(prompts).ui.process.subscribe(
  next => {
    console.log("next", next);
    if (next.name === "command") {
      switch (next.answer) {
        case "exit":
          prompts.complete();
          break;
        case "connect":
          if (!state.client) {
            prompts.next(connectHost);
            prompts.next(connectPort);
            prompts.next(connectClientId);
            prompts.next(connectClientSecret);
          } else {
            prompts.error(new Error("already connected"));
          }
          break;
        case "disconnect":
          if (state.client) {
            state.client.end();
            state.client = undefined;
          } else {
            prompts.error(new Error("already disconnected"));
          }
          break;
      }
    }
  },
  error => console.log("error", error),
  () => console.log("complete")
);
prompts.next(mainMenu);
new Date().toISOString();
