WASI_SYSROOT = /opt/wasi-sdk/wasi-sysroot

SRC = main.v
WASM_BIN = wasmto-js.wasm
JS_BIN = wasmto-js.mjs
TARGETS = $(WASM_BIN) $(JS_BIN)

CFLAGS = --target=wasm32-wasi --sysroot=$(WASI_SYSROOT) -I$(CURDIR)/stub -D_WASI_EMULATED_SIGNAL -lwasi-emulated-signal -DWNOHANG=1

.PHONY: all clean

all: $(TARGETS)

$(JS_BIN): $(WASM_BIN)
	wasm-opt -Os -o - $<|wasmtime $< > $@

$(WASM_BIN): $(SRC)
	v -m32 -cc clang -cflags '$(CFLAGS) -o $@' -o $@ $<

clean:
	$(RM) $(TARGETS)
