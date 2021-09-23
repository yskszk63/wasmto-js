// @deno-types="./example.wasm.d.ts"
import { compile, Exports } from './example.wasm.js';

const mod = await compile();
const instance = await WebAssembly.instantiate(mod, {
    env: {
        import_func: () => {},
    }
});
const answer = (instance.exports as Exports).add(1, 2);
if (answer !== 3) {
    throw new Error("assertion failed.");
}

console.log("It's okay.");
