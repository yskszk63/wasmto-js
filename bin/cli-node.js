import { stdin, stdout, wasmtoJs, wasmtoDts } from 'wasmto-js';

const reader = stdin();
const writer = stdout();

const dts = process.argv.includes('--dts', 2);
if (dts) {
    await wasmtoDts(reader, writer);
} else {
    await wasmtoJs(reader, writer);
}
