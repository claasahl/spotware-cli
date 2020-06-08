import {PassThrough} from "stream";

import * as B from "../base";

export class TrendbarsStream extends PassThrough implements B.TrendbarsStream {
  readonly props: B.TrendbarsProps;

  constructor(props: B.TrendbarsProps) {
    super({objectMode: true});
    this.props = Object.freeze(props);
  }

  push(chunk: B.TrendbarEvent | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }
}