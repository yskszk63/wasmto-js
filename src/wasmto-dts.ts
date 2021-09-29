import { parse, typeidx, funcidx, functype } from "stream-wasm-parser";

interface Generator {
  gen(output: WritableStreamDefaultWriter<string>): Promise<void>;
}

class FuncGen {
  name: string;
  type: functype;
  constructor(name: string, type: functype) {
    this.name = name;
    this.type = type;
  }
  async gen(output: WritableStreamDefaultWriter<string>): Promise<void> {
    const params = this.type.val.parameters.map((t, i) => `p${i}: ${t}`).join(', ');
    switch (this.type.val.results.length) {
    case 0: {
      await output.write(`${this.name}(${params}): void`);
      break;
    }
    case 1: {
      await output.write(`${this.name}(${params}): ${this.type.val.results[0]}`);
      break;
    }
    default: {
      await output.write(`${this.name}(${params}): ${this.type.val.results.join(', ')}`);
      break;
    }
    }
  }
}

class GeneralGen {
  name: string;
  ty: string;
  constructor(name: string, ty: string) {
    this.name = name;
    this.ty = ty;
  }
  async gen(output: WritableStreamDefaultWriter<string>): Promise<void> {
    await output.write(`${this.name}: ${this.ty};`);
  }
}

export async function wasmtoDts(
  input: ReadableStream<Uint8Array>,
  output: WritableStream<Uint8Array>,
) {
  const types = new Map<typeidx, functype>();
  const funcs = new Map<funcidx, typeidx>();
  const generators: Generator[] = [];

  for await (const sec of parse(input)) {
    switch (sec.tag) {
    case 'type': {
      types.set(sec.val.index, sec.val.val);
      break;
    }
    case 'func': {
      funcs.set(sec.val.index, sec.val.val);
      break;
    }
    case 'import': {
      const desc = sec.val.desc;
      switch (desc.tag) {
      case 'func': {
        funcs.set(desc.val.index, desc.val.val);
        break;
      }
      }
      break;
    }
    case 'export': {
      const desc = sec.val.desc;
      switch (desc.tag) {
      case 'func': {
        const func = funcs.get(desc.val);
        if (typeof func === 'undefined') {
          throw new Error("no function found.");
        }
        const fty = types.get(func);
        if (typeof fty === 'undefined') {
          throw new Error("no function type found.");
        }
        generators.push(new FuncGen(sec.val.name, fty));
        break;
      }
      case 'mem': {
        generators.push(new GeneralGen(sec.val.name, "WebAssembly.Memory"));
        break;
      }
      case 'table': {
        generators.push(new GeneralGen(sec.val.name, "WebAssembly.Table"));
        break;
      }
      case 'global': {
        generators.push(new GeneralGen(sec.val.name, "WebAssembly.Global"));
        break;
      }
      }
      break;
    }
    }
  }

  const { readable, writable } = new TextEncoderStream();
  const pipetask = readable.pipeTo(output);
  const writer = writable.getWriter();
  try {
    await writer.write(
      "export declare function compile(): Promise<WebAssembly.Module>\n",
    );
    await writer.write("\n");
    await writer.write("export type i32 = number;\n");
    await writer.write("export type i64 = BigInt;\n");
    await writer.write("export type i32 = number;\n");
    await writer.write("export type i32 = number;\n");
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
