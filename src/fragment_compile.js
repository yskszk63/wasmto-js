export function compile() {
  if (
    typeof ReadableByteStreamController !== "undefined" &&
    typeof WebAssembly.compileStreaming === "function"
  ) {
    const iter = data();
    const stream = new ReadableStream({
      pull(controller) {
        const result = iter.next();
        if (result.done) {
          controller.close();
        }
        controller.enqueue(
          Uint8Array.from(atob(result.value), (c) => c.charCodeAt(0)),
        );
      },
      type: "bytes",
    });
    return WebAssembly.compileStreaming(
      new Response(stream, {
        headers: [
          ["Content-Type", "application/wasm"],
        ],
      }),
    );
  } else {
    const content = [];
    for (const d of data()) {
      content.push(...Array.from(atob(d), (c) => c.charCodeAt(0)));
    }
    return WebAssembly.compile(Uint8Array.from(content));
  }
}
