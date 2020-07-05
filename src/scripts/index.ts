import yargs from 'yargs'

import local from "./local"
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
    "oppurtunities <output> [inputs...]", 
    "generates JSON-file with trading oppurtunities",
    yargs => yargs.options({
        inputs: {type: 'string', demandOption: true},
        output: {type: 'string', demandOption: true},
    }).array("inputs"),
    ({output, inputs}) => oppurtunities(output, inputs)
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
