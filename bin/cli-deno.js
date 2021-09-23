import { Buffer } from 'https://deno.land/x/std@0.108.0/node/buffer.ts';
// @deno-types="../wasmto-js.d.ts"
import { stdin, stdout, wasmtoJs, wasmtoDts } from '../dist/wasmto-js.js';

const reader = stdin();
const writer = stdout();

//await wasmtoJs(reader, writer);

window.Buffer = Buffer;
await wasmtoDts(reader, writer);
