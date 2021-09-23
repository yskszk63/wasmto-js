WASI_SYSROOT = /opt/wasi-sdk/wasi-sysroot

SRC = src/index.ts src/stream.ts src/wasmto-js.ts $(FRAGMENTS_JS)
JS_BIN = dist/wasmto-js.js
FRAGMENTS_JS = gen/fragments.ts
TARGETS = $(JS_BIN) tests/example.wasm tests/example.wasm.js

.SUFFIXES: .wat .wasm .wasm.js

.wat.wasm:
	wat2wasm -o $@ $<

.wasm.wasm.js:
	deno run bin/cli-deno.js < $< > $@

.PHONY: all
all: $(TARGETS)

.PHONY: test
test: tests/example.wasm.js
	deno run tests/deno-test.ts $<
	node tests/node-test.mjs $<

tests/example.mjs: tests/example.wasm $(WASM_BIN)
	$(WASM_BIN) < $< > $@

$(JS_BIN): $(SRC)
	mkdir -p dist
	npx esbuild $< --bundle --outfile=$@ --format=esm --minify --external:node:\* --external:fs
	#npx esbuild $< --bundle --outfile=$@ --format=esm --external:node:\* --external:fs

$(FRAGMENTS_JS): src/fragment_compile.js
	mkdir -p gen
	echo -n 'export const compile = atob("' > $@
	base64 -w0 src/fragment_compile.js >> $@
	echo '");' >> $@

.PHONY: clean
clean:
	$(RM) $(TARGETS)
