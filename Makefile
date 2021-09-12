WASI_SYSROOT = /opt/wasi-sdk/wasi-sysroot

SRC = main.v
BIN = wasmto-js.wasm

CFLAGS = --target=wasm32-wasi --sysroot=$(WASI_SYSROOT) -I$(CURDIR)/stub -D_WASI_EMULATED_SIGNAL -lwasi-emulated-signal -DWNOHANG=1

.PHONY: all clean

all: $(BIN)

$(BIN): $(SRC)
	v -m32 -cc clang -cflags '$(CFLAGS) -o $@' -o $@ $<

clean:
	$(RM) $(BIN)
