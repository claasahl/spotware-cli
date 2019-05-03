import inquirer from "inquirer";
import * as Rx from "rxjs";

import STORE from "./store";
import { connect, disconnect } from "./actions";

const mainMenu = {
  type: "list",
  name: "command",
  message: "What do you want to do?",
  choices: [
    {
      name: "connect to server",
      value: "connect",
      disabled: () =>
        STORE.getState().connected ? "already connected" : undefined
    },
    {
      name: "disconnect from server",
      value: "disconnect",
      disabled: () =>
        !STORE.getState().connected ? "not connected" : undefined
    },
    new inquirer.Separator(),
    {
      name: "exit client",
      value: "exit",
      disabled: () =>
        STORE.getState().connected ? "still connected" : undefined
    }
  ]
};

const prompts = new Rx.Subject<inquirer.Question>();
inquirer.prompt(prompts).ui.process.subscribe(
  next => {
    if (next.name === "command") {
      switch (next.answer) {
        case "exit":
          prompts.complete();
          unscribe();
          break;
        case "connect":
          STORE.dispatch(connect());
          break;
        case "disconnect":
          STORE.dispatch(disconnect());
          break;
      }
    }
  },
  error => console.log("error", error),
  () => console.log("complete")
);

prompts.next(mainMenu);
const unscribe = STORE.subscribe(() => prompts.next(mainMenu));
