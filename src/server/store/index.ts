import { Account, account } from "./account";

export const VERSION = "00";

export const STORE: {
  [ctidTraderAccountId: number]: Account;
} = {
  123456: account(123456),
};
