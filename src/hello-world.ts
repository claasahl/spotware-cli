import inquirer from "inquirer";
import {
  connect,
  fromProtoMessage,
  toProtoMessage,
  writeProtoMessage
} from "@claasahl/spotware-adapter";

// establish connection
const client = connect(
  5035,
  "live.ctraderapi.com"
);

// handle (incoming) proto messages
client.on("PROTO_MESSAGE", (message, payloadType) => {
  console.log(payloadType);
  switch (payloadType) {
    case "ERROR_RES": {
      const msg = fromProtoMessage("ERROR_RES", message);
      console.log(msg);
      break;
    }
    case "PROTO_OA_VERSION_REQ": {
      const msg = fromProtoMessage("PROTO_OA_VERSION_REQ", message);
      console.log(msg);
      break;
    }
    case "PROTO_OA_VERSION_RES": {
      const msg = fromProtoMessage("PROTO_OA_VERSION_RES", message);
      console.log(msg);
      break;
    }
  }
});

// write (outgoing) proto messages
setInterval(() => {
  const message = toProtoMessage("HEARTBEAT_EVENT", {});
  writeProtoMessage(client, message);
}, 10000);

writeProtoMessage(client, toProtoMessage("PROTO_OA_VERSION_REQ", {}));

console.log("Hi, welcome to Node Pizza");

var questions = [
  {
    type: "confirm",
    name: "toBeDelivered",
    message: "Is this for delivery?",
    default: false
  },
  {
    type: "input",
    name: "phone",
    message: "What's your phone number?",
    validate: (value: string) => {
      var pass = value.match(
        /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
      );
      if (pass) {
        return true;
      }

      return "Please enter a valid phone number";
    }
  },
  {
    type: "list",
    name: "size",
    message: "What size do you need?",
    choices: ["Large", "Medium", "Small"],
    filter: (val: string) => {
      return val.toLowerCase();
    }
  },
  {
    type: "input",
    name: "quantity",
    message: "How many do you need?",
    validate: (value: string) => {
      var valid = !isNaN(parseFloat(value));
      return valid || "Please enter a number";
    },
    filter: Number
  },
  {
    type: "expand",
    name: "toppings",
    message: "What about the toppings?",
    choices: [
      {
        key: "p",
        name: "Pepperoni and cheese",
        value: "PepperoniCheese"
      },
      {
        key: "a",
        name: "All dressed",
        value: "alldressed"
      },
      {
        key: "w",
        name: "Hawaiian",
        value: "hawaiian"
      }
    ]
  },
  {
    type: "rawlist",
    name: "beverage",
    message: "You also get a free 2L beverage",
    choices: ["Pepsi", "7up", "Coke"]
  },
  {
    type: "input",
    name: "comments",
    message: "Any comments on your purchase experience?",
    default: "Nope, all good!"
  },
  {
    type: "list",
    name: "prize",
    message: "For leaving a comment, you get a freebie",
    choices: ["cake", "fries"],
    when: (answers: any) => {
      return answers.comments !== "Nope, all good!";
    }
  }
];

inquirer.prompt(questions).then(answers => {
  console.log("\nOrder receipt:");
  console.log(JSON.stringify(answers, null, "  "));
});
