SRC = src/index.ts src/stream.ts src/wasmto-js.ts src/wasmto-dts.ts
JS_BIN = dist/wasmto-js.js
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
	npx esbuild $< --bundle --outfile=$@ --format=esm --minify --external:node:\*

.PHONY: check
check:
	npx tsc
	deno lint

.PHONY: clean
clean:
	$(RM) $(TARGETS) $(TEST_TARGETS)
