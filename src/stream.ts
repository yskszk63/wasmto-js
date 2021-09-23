declare const Deno: {
    stdin: {
        read(p: Uint8Array): Promise<number | null>,
    },
    stdout: {
        write(p: Uint8Array): Promise<number>,
    },
} | undefined;

export let stdin: () => ReadableStream<Uint8Array> = () => { throw new Error("stub"); }
export let stdout: () => WritableStream<Uint8Array> = () => { throw new Error("stub"); }

declare module 'node:stream/web' {
    export const TransformStream: TransformStream;
    export const ReadableStream: ReadableStream;
    export const WritableStream: WritableStream;
    export const TextEncoderStream: TextEncoderStream;
}

if (typeof process !== 'undefined') {
    const { TransformStream, ReadableStream, WritableStream, TextEncoderStream } = await import('node:stream/web');
    Object.assign(global, {
        TransformStream,
        ReadableStream,
        WritableStream,
        TextEncoderStream,
    });
}

if (typeof process !== 'undefined') {
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
            type: 'bytes',
        });
    }

    stdout = () => {
        const stdout = process.stdout;
        return new WritableStream({
            write(chunk, _controller) {
                return new Promise((resolve, reject) => {
                    stdout.write(chunk, err => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    });
                });
            },
        });
    }

} else if (typeof Deno !== 'undefined') {
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
            type: 'bytes',
        });
    }
    stdout = () => {
        const stdout = Deno!.stdout;
        return new WritableStream({
            async write(chunk, _controller) {
                let rest = chunk.byteLength;
                while (rest > 0) {
                    const n = await stdout.write(chunk.slice(0, rest));
                    rest -= n;
                }
            }
        });
    }
} else {
    // browser
}

export class Base64TransformStream extends TransformStream<Iterable<number>, string> {
    constructor() {
        super({
            transform(chunk, controller) {
                const b64 = btoa(String.fromCharCode(...chunk));
                controller.enqueue(b64);
            },
        })
    }
}

export class IntoGeneratorCodeTransformStream extends TransformStream<string, string> {
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
        })
    }
}

export class AppendTrailerTransformStream<T> extends TransformStream<T, T> {
    constructor(trailer: T) {
        super({
            flush(controller) {
                controller.enqueue(trailer);
            },
        })
    }
}
