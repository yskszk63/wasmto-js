WASI_SYSROOT = /opt/wasi-sdk/wasi-sysroot

SRC = src/index.ts src/stream.ts src/wasmto-js.ts src/wasmto-dts.ts $(FRAGMENTS_JS)
JS_BIN = dist/wasmto-js.js
FRAGMENTS_JS = gen/fragments.ts
TARGETS = $(JS_BIN)
TEST_TARGETS = it/example.wasm it/example.wasm.js it/example.wasm.d.ts

.SUFFIXES: .wat .wasm .wasm.js .wasm.d.ts

.wat.wasm:
	wat2wasm -o $@ $<

.wasm.wasm.js:
	deno run bin/cli-deno.ts < $< > $@

.wasm.wasm.d.ts:
	deno run bin/cli-deno.ts --dts < $< > $@

.PHONY: all
all: $(JS_BIN)

.PHONY: test
test: it/example.wasm.js it/example.wasm.d.ts
	deno run it/deno-test.ts
	node it/node-test.mjs

$(TEST_TARGETS): $(JS_BIN)

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
	$(RM) $(TARGETS) $(TEST_TARGETS)
