#!/usr/bin/env node

(async () => {
    const { compile } = await import('../wasmto-js.js');
    const fs = await import('fs');

    const mod = await compile();
    const instance = await WebAssembly.instantiate(mod, {
        wasi_snapshot_preview1: {
            proc_exit(rval) {
                throw new Error(`program exit ${rval}`);
            },
            args_sizes_get(result) {
                const mem = new DataView(instance.exports.memory.buffer);
                mem.setUint32(result + 0, 0, true);
                mem.setUint32(result + 4, 0, true);
                return 0;
            },
            args_get() {
                return 0;
            },
            fd_fdstat_get(fd, result) {
                const mem = new DataView(instance.exports.memory.buffer);
                switch (fd) {
                case 0:
                    mem.setUint8(result + 0, 2); // character device
                    mem.setUint16(result + 2, 0b0, true);
                    mem.setBigUint64(result + 8, 0b00_0010n, true);
                    mem.setBigUint64(result + 16, 0n, true);
                    return 0;
                case 1:
                    mem.setUint8(result + 0, 2); // character device
                    mem.setUint16(result + 2, 0b1, true); // append
                    mem.setBigUint64(result + 8, 0b10_0000n, true);
                    mem.setBigUint64(result + 16, 0n, true);
                    return 0;
                default:
                    mem.setUint16(result, 8, true); // badf
                    return 1;
                }
            },
            fd_write(fd, iovec, niovec, result) {
                if (fd !== 1) {
                    mem.setUint16(result, 8, true); // badf
                    return 1;
                }

                const mem = new DataView(instance.exports.memory.buffer);
                let written = 0;
                for (const ptr of Array.from({length: niovec}, (_, i) => iovec + (i * 8))) {
                    const buf = mem.getUint32(ptr + 0, true);
                    const len = mem.getUint32(ptr + 4, true);
                    written += fs.writeSync(fd, mem, buf, len);
                }
                mem.setUint32(result, written, true);
                return 0;
            },
            fd_read(fd, iovec, niovec, result) {
                const mem = new DataView(instance.exports.memory.buffer);
                if (fd !== 0) {
                    mem.setUint16(result, 8, true); // badf
                    return 1;
                }
                if (niovec < 1) {
                    mem.setUint16(result, 19, true); // inval
                    return 1;
                }

                const buf = mem.getUint32(iovec + 0, true);
                const len = mem.getUint32(iovec + 4, true);
                const read = fs.readSync(fd, mem, buf, len);
                mem.setUint32(result, read, true);
                return 0;
            },
            fd_seek() {
                throw new Error("not implemented");
            },
            fd_close(fd) {
                fs.closeSync(fd);
            },
        },
    });
    instance.exports._start();
})();