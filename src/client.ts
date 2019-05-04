import inquirer from "inquirer";
import * as Rx from "rxjs";

import STORE from "./store";
import { configure, connect, disconnect } from "./actions";

const mainMenu = {
  type: "list",
  name: "command",
  message: "What do you want to do?",
  choices: [
    {
      name: "configure server",
      value: "configure",
      disabled: () =>
        STORE.getState().spotware.connected ? "already connected" : undefined
    },
    {
      name: "connect to server",
      value: "connect",
      disabled: () =>
        STORE.getState().spotware.connected ? "already connected" : undefined
    },
    {
      name: "disconnect from server",
      value: "disconnect",
      disabled: () =>
        !STORE.getState().spotware.connected ? "not connected" : undefined
    },
    new inquirer.Separator(),
    {
      name: "exit client",
      value: "exit",
      disabled: () =>
        STORE.getState().spotware.connected ? "still connected" : undefined
    }
  ]
};

const askForHost = {
  type: "list",
  name: "host",
  message: "To which host do you want to connect?",
  choices: ["demo.ctraderapi.com", "live.ctraderapi.com"],
  default: "live.ctraderapi.com"
};
const askForPort = {
  type: "number",
  name: "port",
  message: "Which port should be connected to?",
  validate: (value: number) => {
    if (value > 0 && value < 65536) {
      return true;
    }
    return "Please enter a valid port number";
  },
  default: 5035
};

const prompts = new Rx.Subject<inquirer.Question>();
inquirer.prompt(prompts).ui.process.subscribe(
  next => {
    if (next.name === "command") {
      switch (next.answer) {
        case "exit":
          prompts.complete();
          break;
        case "configure":
          prompts.next(askForHost);
          prompts.next(askForPort);
          prompts.next(mainMenu);
          break;
        case "connect":
          STORE.dispatch(connect());
          prompts.next(mainMenu);
          break;
        case "disconnect":
          STORE.dispatch(disconnect());
          prompts.next(mainMenu);
          break;
      }
    } else if (next.name === "host") {
      STORE.dispatch(configure(next.answer, STORE.getState().spotware.port));
    } else if (next.name === "port") {
      STORE.dispatch(configure(STORE.getState().spotware.host, next.answer));
    }
  },
  error => console.log("error", error),
  () => console.log("complete")
);

prompts.next(mainMenu);
