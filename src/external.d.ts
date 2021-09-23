declare module "@webassemblyjs/wasm-parser" {
  import { Program } from "@webassemblyjs/ast";
  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/wasm-parser/src/index.js#L160
  declare function decode(
    buf: ArrayBuffer,
    customOpts: Record<string, unknown>,
  ): Program;
}

declare module "@webassemblyjs/ast" {
  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L20
  type U32Literal = NumberLiteral;
  type Typeidx = U32Literal;
  type Funcidx = U32Literal;
  type Tableidx = U32Literal;
  type Memidx = U32Literal;
  type Globalidx = U32Literal;
  type Localidx = U32Literal;
  type Labelidx = U32Literal;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L29
  type Index =
    | Typeidx
    | Funcidx
    | Tableidx
    | Memidx
    | Globalidx
    | Localidx
    | Labelidx
    | Identifier;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L39
  type SignatureOrTypeRef = Index | Signature;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L6
  type Node =
    | Identifier
    | NumberLiteral
    | Signature
    | Program
    | Func
    | FuncImportDescr
    | ModuleExport
    | ModuleExportDescr
    | Memory
    | Global
    | Table
    | Unknown;

  // added
  type Unknown = {
    type: "__exhaustive";
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L324
  type ModuleExportDescr = {
    type: "ModuleExportDescr";
    exportType: ExportDescrType;
    id: Index;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L331
  type ModuleExport = {
    type: "ModuleExport";
    name: string;
    descr: ModuleExportDescr;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L353
  type Program = {
    type: "Program";
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L398
  type Func = {
    type: "Func";
    name: Index | null;
    signature: SignatureOrTypeRef;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L309
  type FuncImportDescr = {
    type: "FuncImportDescr";
    id: Identifier;
    signature: Signature;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L359
  type Identifier = {
    type: "Identifier";
    value: string;
    raw?: string;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L202
  type NumberLiteral = {
    type: "NumberLiteral";
    value: number;
    raw: string;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L302
  type Memory = {
    type: "Memory";
    id: Index | null;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L285
  type Global = {
    type: "Global";
    name: Identifier | null;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L293
  type Table = {
    type: "Table";
    name: Identifier | null;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/nodes.js#L346
  type Signature = {
    type: "Signature";
    params: Array<FuncParam>;
    results: Array<Valtype>;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L70
  type FuncParam = {
    id: string | null;
    valtype: Valtype;
  };

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L87
  //type ExportDescrType = "Func" | "Table" | "Memory" | "Global";
  type ExportDescrType = "Func" | "Table" | "Mem" | "Global";

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/basic.js#L41
  type Valtype = "i32" | "i64" | "f32" | "f64" | "u32" | "label";

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/traverse.js#L6
  type NodePathContext<T> = {
    node: T;
  };

  type NodePathOperations = Record<string, never>;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/traverse.js#L26
  type NodePath<T> = NodePathContext<T> & NodePathOperations;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/types/traverse.js#L4
  type TraverseCallback = (type: string, path: NodePath<Node>) => void;

  // https://github.com/xtuc/webassemblyjs/blob/7a0b8b8fdeeb3990fb9e4215b0ff8bce3f2f81c1/packages/ast/src/traverse.js#L63
  declare function traverse(
    node: Node,
    visitors: Record<string, unknown>,
    before?: TraverseCallback,
    after?: TraverseCallback,
  ): void;
}
