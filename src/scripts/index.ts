import yargs from 'yargs'
import {execFile} from "child_process";
import debug from "debug"

import config from "../config"
import local from "./local"
import refresh from "./refresh"
import fetch from "./fetch"
import performance from "./performance"
import spotware from "./spotware"
import insideBarLocal from "./insideBarLocal"
import insideBarRemote from "./insideBarRemote"
import oppurtunities from "./oppurtunities"
import review from "./review"

// Idea: Write services which consume events (from other services) and produce events (for other services to consume).

// Services must only emit their "own" events... not events from other services (separation of concern)

// Each service should have a Base implementation and at least a Debug imlementation (which allows emitting of all service-owned events)

// each service should export a class that extends (and completes) its base implementation
// alternatively, new services may be introduced through factory/creator-functions

// each service must expose a callback-function for every documented event, which provides access to the last event. The function must be named after the event.

// review all base/*.ts and local/*.ts files for "Promises vs callbacks" and "Promises vs 'sync' returns"

// philosophy: for awesome readablity format all events like so {timestamp, type, ...rest}

function header() {
    execFile("git", ["rev-parse", "HEAD"], (_error, stdout, _stderr) => {
      debug("CONFIG")("%j", {config, git: stdout, env: process.env})
    })
  }
  header();

yargs
.command(
    "local [inputs...]",
    "process local price data",
    yargs => yargs.options({
        currency: {type: 'string', default: 'EUR'},
        symbol: {type: 'string', default: 'BTC/EUR'},
        inputs: {type: 'string', demandOption: true},
    }).array("inputs"),
    ({currency, symbol, inputs}) => local(inputs, currency, symbol)
)
.command(
    "refresh",
    "refresh spotware tokens in .env-file",
    {},
    () => refresh()
)
.command(
    "fetch <from> <to> <output>",
    "fetch price data from spotware",
    yargs => yargs.options({
        from: {type: 'string', description: "e.g. 2020-01-01T00:00:00.000Z"},
        to: {type: 'string', description: "e.g. 2020-07-01T00:00:00.000Z"},
        output: {type: 'string', description: "e.g. 2020-h1.json", demandOption: true},
        symbol: {type: 'string', default: 'BTC/EUR'},
    }),
    ({from, to, output, symbol}) => fetch(from, to, output, symbol)
)
.command(
    "spotware", 
    "process remote price data",
    yargs => yargs.options({
        currency: {type: 'string', default: 'EUR'},
        symbol: {type: 'string', default: 'BTC/EUR'},
    }),
    ({currency, symbol}) => spotware(currency, symbol)
)
.command(
    "insideBarLocal [inputs...]", 
    "run 'inside bar momentum' strategy from local price data",
    yargs => yargs.options({
        currency: {type: 'string', default: 'EUR'},
        symbol: {type: 'string', default: 'BTC/EUR'},
        inputs: {type: 'string', demandOption: true},
    }).array("inputs"),
    ({currency, symbol, inputs}) => insideBarLocal(inputs, currency, symbol)
)
.command(
    "insideBarRemote", 
    "run 'inside bar momentum' strategy from remote price data",
    yargs => yargs.options({
        currency: {type: 'string', default: 'EUR'},
    }).array("inputs"),
    ({currency}) => insideBarRemote(currency)
)
.command(
    "performance",
    "test script for measuring peformance",
    yargs => yargs.options({
        symbol: {type: 'string', default: 'BTC/EUR'},
    }).array("inputs"),
    ({symbol}) => performance(symbol)
)
.command(
    "oppurtunities <simplified> <output> [inputs...]", 
    "generates JSON-file with trading oppurtunities",
    yargs => yargs.options({
        inputs: {type: 'string', demandOption: true},
        output: {type: 'string', demandOption: true},
        simplified: {type: 'boolean', demandOption: true}
    }).array("inputs"),
    ({output, inputs, simplified}) => oppurtunities(simplified, output, inputs)
)
.command(
    "review <output> [inputs...]", 
    "generates CSV-file with order-data",
    yargs => yargs.options({
        inputs: {type: 'string', demandOption: true},
        output: {type: 'string', demandOption: true},
    }).array("inputs"),
    ({output, inputs}) => review(output, inputs)
)
.demandCommand()
.help('h')
.alias('h', 'help').argv;
