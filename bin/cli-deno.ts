// @ts-nocheck :deno
// @deno-types="../wasmto-js.d.ts"
import { wasmtoJs, wasmtoDts } from '../dist/wasmto-js.js';

const reader = Deno.stdin.readable;
const writer = Deno.stdout.writable;

const dts = Deno.args.some(item => item === '--dts');
if (dts) {
    await wasmtoDts(reader, writer);
} else {
    await wasmtoJs(reader, writer);
}
