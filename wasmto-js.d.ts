/**
 * Get compiled WebAssembly module.
 */
export declare function stdin(): ReadableStream<Uint8Array>;
export declare function stdout(): WritableStream<Uint8Array>;

export declare function wasmtoJs(input: ReadableStream<Uint8Array>, output: WritableStream<Uint8Array>): Promise<void>;
export declare function wasmtoDts(input: ReadableStream<Uint8Array>, output: WritableStream<Uint8Array>): Promise<void>;
