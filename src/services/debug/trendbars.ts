import {PassThrough} from "stream";
import debug from "debug";
import ms from "ms";

import * as B from "../base";

const events: B.TrendbarEvent["type"][] = ["TRENDBAR"]

export class TrendbarsStream extends PassThrough implements B.TrendbarsStream {
  readonly props: B.TrendbarsProps;
  private readonly log: debug.Debugger;

  constructor(props: B.TrendbarsProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    this.log = debug("trendbars")
      .extend(props.symbol.toString())
      .extend(ms(props.period));
  }

  push(chunk: B.TrendbarEvent | null, encoding?: BufferEncoding): boolean {
    if(chunk && events.includes(chunk.type)) {
      this.log("%j", chunk);
    }
    return super.push(chunk, encoding);
  }
}