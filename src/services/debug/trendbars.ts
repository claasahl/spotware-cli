import {PassThrough} from "stream";

import * as T from "../types";
import * as L from "../logging";

export class TrendbarsStream extends PassThrough implements T.TrendbarsStream {
  readonly props: T.TrendbarsProps;

  constructor(props: T.TrendbarsProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
    L.logTrendbarEvents(this);
  }

  push(chunk: T.TrendbarEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }
}