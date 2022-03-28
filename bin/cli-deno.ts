// @ts-nocheck :deno
import { Buffer } from 'https://deno.land/x/std@0.108.0/node/buffer.ts';
// @deno-types="../wasmto-js.d.ts"
import { stdin, stdout, wasmtoJs, wasmtoDts } from '../dist/wasmto-js.js';

const reader = stdin();
const writer = stdout();

const dts = Deno.args.some(item => item === '--dts');
if (dts) {
    Object.assign(window, { Buffer, });
    await wasmtoDts(reader, writer);
} else {
    await wasmtoJs(reader, writer);
}
