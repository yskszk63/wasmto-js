WASI_SYSROOT = /opt/wasi-sdk/wasi-sysroot

SRC = main.v
WASM_BIN = wasmto-js.wasm
JS_BIN = wasmto-js.mjs
TARGETS = $(WASM_BIN) $(JS_BIN) tests/example.wasm tests/example.mjs

CFLAGS = --target=wasm32-wasi --sysroot=$(WASI_SYSROOT) -I$(CURDIR)/stub -D_WASI_EMULATED_SIGNAL -lwasi-emulated-signal -DWNOHANG=1

.PHONY: all clean test

all: $(TARGETS)

test: tests/example.mjs
	deno run tests/deno-test.ts
	node tests/node-test.mjs

tests/example.mjs: tests/example.wasm $(WASM_BIN)
	wasmtime $(WASM_BIN) < $< > $@

tests/example.wasm: tests/example.wat
	wat2wasm -o $@ $<

$(JS_BIN): $(WASM_BIN)
	wasm-opt -Os -o - $<|wasmtime $< > $@
	cp $@ npm

$(WASM_BIN): $(SRC)
	v -m32 -cc clang -cflags '$(CFLAGS) -o $@' -o $@ $<
	cp $@ npm

clean:
	$(RM) $(TARGETS)
