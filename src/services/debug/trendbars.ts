import {PassThrough} from "stream";

import * as B from "../base";
import * as L from "../logging";

export class TrendbarsStream extends PassThrough implements B.TrendbarsStream {
  readonly props: B.TrendbarsProps;

  constructor(props: B.TrendbarsProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    L.logTrendbarEvents(this);
  }

  push(chunk: B.TrendbarEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }
}