import {
  AppendTrailerTransformStream,
  Base64TransformStream,
  IntoGeneratorCodeTransformStream,
} from "./stream";
import { compile } from "../gen/fragments";

export async function wasmtoJs(
  input: ReadableStream<Uint8Array>,
  output: WritableStream<Uint8Array>,
) {
  // TODO check header
  await input
    .pipeThrough(new Base64TransformStream())
    .pipeThrough(new IntoGeneratorCodeTransformStream())
    .pipeThrough(new AppendTrailerTransformStream(compile))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(output);
}
