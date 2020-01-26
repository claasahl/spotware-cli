import { EventEmitter } from "events";

import * as Account from "./account";

const emitter = new EventEmitter();
const accountService = new Account.Service(emitter);
accountService.balanceChanged(10);
accountService.balanceChanged(-1);
accountService.balanceChanged(5);
accountService.balanceChanged(-0.5);
accountService.equityChanged(4);
accountService.equityChanged(-7);
accountService.marginChanged(4);
accountService.marginChanged(-1);
