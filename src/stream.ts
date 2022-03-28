declare const Deno: {
  stdin: {
    read(p: Uint8Array): Promise<number | null>;
  };
  stdout: {
    write(p: Uint8Array): Promise<number>;
  };
} | undefined;

export let stdin: () => ReadableStream<Uint8Array> = () => {
  throw new Error("stub");
};
export let stdout: () => WritableStream<Uint8Array> = () => {
  throw new Error("stub");
};

if (typeof process !== "undefined") {
  const { TransformStream, ReadableStream, WritableStream, TextEncoderStream } =
    await import("node:stream/web");
  Object.assign(global, {
    TransformStream,
    ReadableStream,
    WritableStream,
    TextEncoderStream,
  });
}

if (typeof process !== "undefined") {
  // node
  stdin = () => {
    const stdin = process.stdin[Symbol.asyncIterator]();
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await stdin.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
      // @ts-ignore: needs type='bytes' UnderlyingSource, but not found.
      type: "bytes",
    });
  };

  stdout = () => {
    const stdout = process.stdout;
    return new WritableStream({
      write(chunk, _controller) {
        return new Promise((resolve, reject) => {
          stdout.write(chunk, (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        });
      },
    });
  };
} else if (typeof Deno !== "undefined") {
  // deno
  stdin = () => {
    const stdin = Deno!.stdin;
    const buf = new Uint8Array(4096);
    return new ReadableStream({
      async pull(controller) {
        const r = await stdin.read(buf);
        if (r !== null) {
          controller.enqueue(buf.slice(0, r));
        } else {
          controller.close();
        }
      },
      // @ts-ignore: needs type='bytes' UnderlyingSource, but not found.
      type: "bytes",
    });
  };
  stdout = () => {
    const stdout = Deno!.stdout;
    return new WritableStream({
      async write(chunk, _controller) {
        let rest = chunk.byteLength;
        while (rest > 0) {
          const n = await stdout.write(chunk.slice(0, rest));
          rest -= n;
        }
      },
    });
  };
} else {
  // browser
}

export class CheckWasmHeaderTransformStream
  extends TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    let check: ((c: Uint8Array) => boolean) | null = (() => {
      const buf = new Uint8Array(8);
      let pos = 0;
      return function(c: Uint8Array): boolean {
        const n = Math.min(buf.length - pos, c.length);
        buf.set(new Uint8Array(c.buffer, 0, n), pos);
        pos += n;
        if (pos === buf.length) {
          const [m1, m2, m3, m4, v1, v2, v3, v4] = buf;
          if (m1 !== 0x00 || m2 !== 0x61 || m3 !== 0x73 || m4 !== 0x6d) {
            throw new Error("invalid WASM header.");
          }
          if (v1 !== 0x01 || v2 !== 0x00 || v3 !== 0x00 || v4 !== 0x00) {
            throw new Error("unsupported WASM version.");
          }
          return true;
        }
        return false;
      }
    })();
    super({
      transform(chunk, controller) {
        if (check && check(chunk)) {
          check = null;
        }
        controller.enqueue(chunk);
      },

      flush(_controller) {
        if (check) {
          throw new Error("could not detect WASM or not.");
        }
      },
    });
  }
}

export class WindowingTransformStream
  extends TransformStream<Uint8Array, Uint8Array> {
  constructor(len: number) {
    const buf = new Uint8Array(len);
    let pos = 0;
    super({
      transform(chunk, controller) {
        const l = chunk.length;
        let p = 0;
        while (p < l) {
          const n = Math.min(len - pos, l - p);
          buf.set(new Uint8Array(chunk.buffer, p, n), pos);
          p += n;
          pos += n;
          if (pos === len) {
            controller.enqueue(buf.slice(0, pos));
            pos = 0;
          }
        }
      },
      flush(controller) {
        controller.enqueue(buf.slice(0, pos));
      },
    });
  }
}

export class Base64TransformStream
  extends TransformStream<Iterable<number>, string> {
  constructor() {
    super({
      transform(chunk, controller) {
        const b64 = btoa(String.fromCharCode(...chunk));
        controller.enqueue(b64);
      },
    });
  }
}

export class IntoGeneratorCodeTransformStream
  extends TransformStream<string, string> {
  constructor() {
    let headerWritten = false;
    const header = "function* data() {\n";
    const trailer = "}\n";
    super({
      transform(chunk, controller) {
        if (!headerWritten) {
          headerWritten = true;
          controller.enqueue(header);
        }
        controller.enqueue(`  yield "${chunk}";${"\n"}`);
      },
      flush(controller) {
        if (!headerWritten) {
          headerWritten = true;
          controller.enqueue(header);
        }
        controller.enqueue(trailer);
      },
    });
  }
}

export class AppendTrailerTransformStream<T> extends TransformStream<T, T> {
  constructor(trailer: T) {
    super({
      flush(controller) {
        controller.enqueue(trailer);
      },
    });
  }
}
