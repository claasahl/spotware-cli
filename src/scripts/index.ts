import yargs from 'yargs'

import local from "./local"
import refresh from "./refresh"
import fetch from "./fetch"
import spotware from "./spotware"
import insideBar from "./insideBar"
import oppurtunities from "./oppurtunities"
import review from "./review"

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
    "insideBar [inputs...]", 
    "run 'inside bar momentum' strategy",
    yargs => yargs.options({
        currency: {type: 'string', default: 'EUR'},
        symbol: {type: 'string', default: 'BTC/EUR'},
        inputs: {type: 'string', demandOption: true},
    }).array("inputs"),
    ({currency, symbol, inputs}) => insideBar(inputs, currency, symbol)
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
