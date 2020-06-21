import ms from "ms";
import fs from "fs"
import readline from "readline";
import {obj as multistream} from "multistream";

async function review (output: string, inputs: string[]) {
    const fileStream = multistream(inputs.map(file => fs.createReadStream(file)))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    const orders = new Map<string, any>()
    for await (const line of rl) {
      if(line.indexOf("account") >= 0) {
        const logEntry = /({.*})/.exec(line);
        const data = JSON.parse(logEntry![1])
        if("id" in data) {
          const id = data.id;
          if(!orders.has(id)) {
            orders.set(id, {})
          }
          const order = orders.get(id)!
          const fromTimestamp = Math.min(data.timestamp, order.fromTimestamp || Number.MAX_VALUE)
          const toTimestamp = Math.max(data.timestamp, order.toTimestamp || Number.MIN_VALUE)
          const from = new Date(fromTimestamp)
          const to = new Date(toTimestamp)
          const duration = ms(toTimestamp-fromTimestamp)
          
          delete data.type;
          delete data.timestamp;
          Object.assign(order, data, {fromTimestamp, toTimestamp, from, to, duration})
        }
      }
    }
  
    console.log(orders)
    const out = fs.createWriteStream(output)
    out.write(`id;type;tradeSide;volume;enter;stopLoss;takeProfit;fromTimestamp;from;toTimestamp;to;expiresTimestamp;expires;duration;entry;exit;price;profitLoss\n`)
    for(const [_id, data] of orders) {
        out.write(`${data.id};${data.orderType};${data.tradeSide};${data.volume};${data.enter};${data.stopLoss};${data.takeProfit};${data.fromTimestamp};${data.from.toISOString()};${data.toTimestamp};${data.to.toISOString()};${data.expiresAt};${new Date(data.expiresAt).toISOString()};${data.duration};${data.entry || ""};${data.exit || ""};${data.price || ""};${data.profitLoss || ""}\n`)
    }
    out.end();
  }
  if(process.argv[2] === "review") {
    // npm run review "output.csv" "input1.log" "input2.log" "input3.log"
    const output = process.argv[3];
    const inputs = process.argv.slice(4)
    review(output, inputs);
  }