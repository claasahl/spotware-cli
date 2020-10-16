import { Messages } from "@claasahl/spotware-adapter";
import { Duplex, Readable, DuplexOptions } from "stream";
import debug from "debug";

const spotware = debug("spotware");
const input = spotware.extend("input");
const inputHuman = input.extend("human");
const output = spotware.extend("output");
const outputHuman = output.extend("human");

export function logInput(msg: CustomMessages) {
  const payloadTypeText = CustomPayloadType[msg.payloadType];
  if (payloadTypeText) {
    spotware.extend(`${msg.payloadType}`)("%j", {
      payload: msg.payload,
    });
    input("%j", {
      payloadType: msg.payloadType,
      payload: msg.payload,
    });
    spotware.extend(payloadTypeText)("%j", {
      payload: msg.payload,
    });
    inputHuman("%j", {
      payloadType: payloadTypeText,
      payload: msg.payload,
    });
  }
}

export function logOutput(msg: CustomMessages) {
  const payloadTypeText = CustomPayloadType[msg.payloadType];
  if (payloadTypeText) {
    spotware.extend(`${msg.payloadType}`)("%j", {
      payload: msg.payload,
    });
    output("%j", {
      payloadType: msg.payloadType,
      payload: msg.payload,
    });
    spotware.extend(payloadTypeText)("%j", {
      payload: msg.payload,
    });
    outputHuman("%j", {
      payloadType: payloadTypeText,
      payload: msg.payload,
    });
  }
}

export enum CustomPayloadType {
  A = 10000,
  B = 10001,
}
export interface CustomMessage<P, T extends CustomPayloadType> {
  payloadType: T;
  payload: P;
}

export type MsgA = CustomMessage<{ a: string }, CustomPayloadType.A>;
export type MsgB = CustomMessage<{ b: number }, CustomPayloadType.B>;

export type CustomMessages = Messages | MsgA | MsgB;

export declare interface CustomSpotwareSocket extends Duplex {
  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (message: CustomMessages) => void): this;
  addListener(event: "end", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: "pause", listener: () => void): this;
  addListener(event: "readable", listener: () => void): this;
  addListener(event: "resume", listener: () => void): this;
  addListener(event: "drain", listener: () => void): this;
  addListener(event: "finish", listener: () => void): this;
  addListener(event: "pipe", listener: (src: Readable) => void): this;
  addListener(event: "unpipe", listener: (src: Readable) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  emit(event: "close"): boolean;
  emit(event: "data", message: CustomMessages): boolean;
  emit(event: "end"): boolean;
  emit(event: "error", err: Error): boolean;
  emit(event: "pause"): boolean;
  emit(event: "readable"): boolean;
  emit(event: "resume"): boolean;
  emit(event: "drain"): boolean;
  emit(event: "finish"): boolean;
  emit(event: "pipe", src: Readable): boolean;
  emit(event: "unpipe", src: Readable): boolean;
  emit(event: string | symbol, ...args: any[]): boolean;

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (message: CustomMessages) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "pause", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "resume", listener: () => void): this;
  on(event: "drain", listener: () => void): this;
  on(event: "finish", listener: () => void): this;
  on(event: "pipe", listener: (src: Readable) => void): this;
  on(event: "unpipe", listener: (src: Readable) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (message: CustomMessages) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: "pause", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "resume", listener: () => void): this;
  once(event: "drain", listener: () => void): this;
  once(event: "finish", listener: () => void): this;
  once(event: "pipe", listener: (src: Readable) => void): this;
  once(event: "unpipe", listener: (src: Readable) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (message: CustomMessages) => void): this; // prettier-ignore
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: "pause", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "resume", listener: () => void): this;
  prependListener(event: "drain", listener: () => void): this;
  prependListener(event: "finish", listener: () => void): this;
  prependListener(event: "pipe", listener: (src: Readable) => void): this;
  prependListener(event: "unpipe", listener: (src: Readable) => void): this;
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this; // prettier-ignore

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (message: CustomMessages) => void): this; // prettier-ignore
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: "pause", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "resume", listener: () => void): this;
  prependOnceListener(event: "drain", listener: () => void): this;
  prependOnceListener(event: "finish", listener: () => void): this;
  prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
  prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this; // prettier-ignore

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (message: CustomMessages) => void): this; // prettier-ignore
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: "pause", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "resume", listener: () => void): this;
  removeListener(event: "drain", listener: () => void): this;
  removeListener(event: "finish", listener: () => void): this;
  removeListener(event: "pipe", listener: (src: Readable) => void): this;
  removeListener(event: "unpipe", listener: (src: Readable) => void): this;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this; // prettier-ignore

  read(size?: number): CustomMessages;
  unshift(message: CustomMessages, encoding?: BufferEncoding): void;
  push(message: CustomMessages | null, encoding?: string): boolean;

  write(message: CustomMessages, encoding?: string, cb?: (error: Error | null | undefined) => void): boolean; // prettier-ignore
  write(message: CustomMessages, cb?: (error: Error | null | undefined) => void): boolean; // prettier-ignore
  end(cb?: () => void): void;
  end(message: CustomMessages, cb?: () => void): void;
  end(message: CustomMessages, encoding?: string, cb?: () => void): void;
}

export class CustomSpotwareSocket extends Duplex {
  private socket;
  private readingPaused;
  private mustCleanUpSocket = true;
  constructor(
    socket: Duplex,
    options: Omit<
      DuplexOptions,
      "objectMode" | "autoDestroy" | "allowHalfOpen"
    > = {}
  ) {
    super({
      ...options,
      objectMode: true,
      autoDestroy: true,
      allowHalfOpen: false,
    });
    this.socket = socket;
    this.readingPaused = false;
    this.wrapSocket();
  }

  private wrapSocket() {
    this.socket.on("end", this.endWithoutCleaningUpSocket.bind(this));
    this.socket.on("finish", this.endWithoutCleaningUpSocket.bind(this));
    this.socket.on("error", this.destroyWithoutCleaningUpSocket.bind(this));
    this.socket.on("close", this.endWithoutCleaningUpSocket.bind(this));
    this.socket.on("readable", this.onReadable.bind(this));
  }

  private endWithoutCleaningUpSocket() {
    this.mustCleanUpSocket = false;
    this.push(null);
  }

  private destroyWithoutCleaningUpSocket(error?: Error) {
    this.mustCleanUpSocket = false;
    this.destroy(error);
  }

  private onReadable() {
    while (!this.readingPaused) {
      const message = this.socket.read();
      if (!message) {
        return;
      }
      const pushOk = this.push(message);
      logInput(message);
      if (!pushOk) this.readingPaused = true;
    }
  }

  _read() {
    this.readingPaused = false;
    setImmediate(this.onReadable.bind(this));
  }

  _write(
    message: CustomMessages,
    _encoding: string,
    callback: (error?: Error | null) => void
  ): void {
    this.socket.write(message, undefined, (err) => {
      logOutput(message);
      callback(err);
    });
  }

  _destroy(error: Error | null, callback: (error: Error | null) => void): void {
    if (this.mustCleanUpSocket) {
      this.socket.destroy(error || undefined);
    }
    callback(error);
  }

  _final(callback: (error?: Error | null) => void): void {
    if (this.mustCleanUpSocket) {
      this.socket.end(callback);
    } else {
      callback();
    }
  }
}
