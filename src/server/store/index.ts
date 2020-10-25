import { Account } from "./account";

export const VERSION = "00";

export const STORE: {
  [ctidTraderAccountId: number]: Account;
} = {
  123456: new Account(123456),
};
