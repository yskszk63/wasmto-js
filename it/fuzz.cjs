const {ReadableStream, WritableStream} = require('node:stream/web');

async function fuzz(buf) {
    const {wasmtoDts} = await import('../dist/wasmto-js.js');

    const read = new ReadableStream({
        start(controller) {
            controller.enqueue(Uint8Array.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));
            controller.enqueue(Uint8Array.from(buf));
            controller.close();
        }
    });
    const write = new WritableStream({});
    try {
        await wasmtoDts(read, write);
    } catch (e) {
        if (!e.message.startsWith("Unexpected section: 0x")
            && e.message.startsWith("Unknown valtype: 0x")
            && e.message.startsWith("Unsupported export type: 0x")
            && e.message !== "invalid UTF-8 encoding"
            && e.message !== "integer too large") {
            throw e;
        }
    }
}

module.exports = {
  fuzz,
};
