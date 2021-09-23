import { compile } from './example.wasm.js';

const mod = await compile();
const instance = await WebAssembly.instantiate(mod, {});
const answer = (instance.exports.add as Function)(1, 2);
if (answer !== 3) {
    throw new Error("assertion failed.");
}

console.log("It's okay.");
