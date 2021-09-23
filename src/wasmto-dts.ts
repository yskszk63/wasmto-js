/// <reference path="./external.d.ts" />

import {decode} from "@webassemblyjs/wasm-parser";
import * as ast from "@webassemblyjs/ast";

interface Generator {
    gen(output: WritableStreamDefaultWriter<string>): Promise<void>;
}

class FuncGen {
    name: string;
    sig: ast.Signature;
    constructor(name: string, sig: ast.Signature) {
        this.name = name;
        this.sig = sig;
    }
    async gen(output: WritableStreamDefaultWriter<string>): Promise<void> {
        const typemap: {[P in ast.Valtype]: string | null} = {
            'i32': 'number',
            'f32': 'number',
            'u32': 'number',
            'i64': 'BigInt',
            'f64': 'BigInt',
            'label': null,
        };

        function toJsType(t: ast.Valtype[]): string {
            const [first, ...rest] = t;
            if (typeof first === 'undefined') {
                return 'void';
            }
            if (rest.length > 0) {
                throw new Error("tuple return not supported.");
            }
            const result = typemap[first];
            if (!result) {
                throw new Error("unknown valtype");
            }
            return result;
        }

        function toJsSig(t: ast.FuncParam[]): string {
            return t.map((item, n) => {
                const ty = typemap[item.valtype];
                if (!ty) {
                    throw new Error("unknown valtype");
                }
                return `p${n}: ${ty}`;
            }).join(", ");
        }

        await output.write(`${this.name}(${toJsSig(this.sig.params)}): ${toJsType(this.sig.results)};`);
    }
}

class GeneralGen {
    name: string;
    ty: string
    constructor(name: string, ty: string) {
        this.name = name;
        this.ty = ty;
    }
    async gen(output: WritableStreamDefaultWriter<string>): Promise<void> {
        await output.write(`${this.name}: ${this.ty};`);
    }
}

export async function wasmtoDts(input: ReadableStream<Uint8Array>, output: WritableStream<Uint8Array>) {
    const contents: number[] = [];
    const reader = input.getReader();
    let result = await reader.read();
    while (!result.done) {
        contents.push(...result.value);
        result = await reader.read();
    }
    const program = decode(Uint8Array.from(contents).buffer, {
        ignoreCodeSection: true,
        ignoreDataSection: true,
    });

    const {readable, writable} = new TextEncoderStream();
    const pipetask = readable.pipeTo(output);
    const writer = writable.getWriter();
    try {
        const funcs: ast.SignatureOrTypeRef[] = [];
        const funcByName: {[P in string]: ast.SignatureOrTypeRef} = {};
        const memory: ast.Memory[] = [];
        const globals: ast.Global[] = [];
        const tables: ast.Table[] = [];

        const generators: Generator[] = [];

        ast.traverse(program, {
            ModuleExport(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'ModuleExport') {
                    const desc = path.node.descr;
                    switch (desc.exportType) {
                    case "Func":
                        switch (desc.id.type) {
                        case 'NumberLiteral': {
                                const sig = funcs[desc.id.value];
                                if (sig.type === 'Signature') {
                                    generators.push(new FuncGen(path.node.name, sig));
                                } else {
                                    throw new Error("signature ref not implemented.");
                                }
                            }
                            break;

                        case 'Identifier': {
                                const sig = funcByName[desc.id.value];
                                if (sig.type === 'Signature') {
                                    generators.push(new FuncGen(path.node.name, sig));
                                } else {
                                    throw new Error("signature ref not implemented.");
                                }
                            }
                            break;
                        }
                        break;

                    case "Mem":
                        generators.push(new GeneralGen(path.node.name, "WebAssembly.Memory"));
                        break;

                    case "Global":
                        generators.push(new GeneralGen(path.node.name, "WebAssembly.Global"));
                        break;

                    case "Table":
                        generators.push(new GeneralGen(path.node.name, "WebAssembly.Table"));
                        break;

                    default:
                        throw new Error("unknown export type.");
                    }
                }
            },

            Func(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'Func') {
                    const func = path.node;
                    funcs.push(func.signature);
                    if (func.name?.type === 'Identifier') {
                        const name = func.name.value;
                        funcByName[name] = func.signature;
                    }
                }
            },

            FuncImportDescr(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'FuncImportDescr') {
                    const func = path.node;
                    funcs.push(func.signature);
                }
            },

            Memory(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'Memory') {
                    memory.push(path.node);
                }
            },

            Global(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'Global') {
                    globals.push(path.node);
                }
            },

            Table(path?: ast.NodePath<ast.Node>) {
                if (path?.node?.type === 'Table') {
                    tables.push(path.node);
                }
            },
        });

        await writer.write("export declare function compile(): Promise<WebAssembly.Module>\n");
        await writer.write("\n");
        await writer.write("export type Exports = {\n");
        for (const gen of generators) {
            await writer.write("  ");
            await gen.gen(writer);
            await writer.write("\n");
        }
        await writer.write("}\n");

    } finally {
        await writer.close();
    }
    await pipetask;

}
