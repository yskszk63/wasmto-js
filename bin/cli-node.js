import { stdin, stdout, wasmtoJs } from 'wasmto-js';

const reader = stdin();
const writer = stdout();

await wasmtoJs(reader, writer);
