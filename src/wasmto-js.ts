import {
  AppendTrailerTransformStream,
  Base64TransformStream,
  CheckWasmHeaderTransformStream,
  IntoGeneratorCodeTransformStream,
  WindowingTransformStream,
} from "./stream";
import fragments from "./fragment_compile.js.txt" assert { type: "text" };

export async function wasmtoJs(
  input: ReadableStream<Uint8Array>,
  output: WritableStream<Uint8Array>,
) {
  await input
    .pipeThrough(new CheckWasmHeaderTransformStream())
    .pipeThrough(new WindowingTransformStream(4096))
    .pipeThrough(new Base64TransformStream())
    .pipeThrough(new IntoGeneratorCodeTransformStream())
    .pipeThrough(new AppendTrailerTransformStream(fragments))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(output);
}
