import os
import encoding.base64

fn writedata() ? {
	mut fp := os.stdin()
	defer {
		fp.close()
	}

	mut h := false

	mut buf := []byte{len: 129}
	for {
		n := fp.read(mut buf) or {
			if err.code == 0 {
				break
			}
			return error("$err")
		}

		if !h {
			println("function* data() {")
			h = true
		}

		b := base64.encode(buf[..n])
		println("  yield '$b';")
	}

	if !h {
		println("function* data() {")
	}
	println("}")
}

fn main() {
	writedata() or {
		eprintln("failed to write data.")
		exit(-1)
	}

	println("export function compile() {")
	println("  if (typeof ReadableByteStreamController !== 'undefined' && typeof WebAssembly.compileStreaming === 'function') {")
	println("    const iter = data();")
	println("    const stream = new ReadableStream({")
	println("      start() { },")
	println("      pull(controller) {")
	println("        const result = iter.next();")
	println("        if (result.done) {")
	println("            controller.close();")
	println("        }")
	println("        controller.enqueue(Uint8Array.from(atob(result.value), c => c.charCodeAt(0)));")
	println("      },")
	println("      type: 'bytes',")
	println("    });")
	println("    return WebAssembly.compileStreaming(new Response(stream, {")
	println("      headers: [")
	println("        ['Content-Type', 'application/wasm'],")
	println("      ],")
	println("    }));")
	println("  } else {")
	println("    const content = [];")
	println("    for (const d of data()) {")
	println("      content.push(...Array.from(atob(d), c => c.charCodeAt(0)));")
	println("    }")
	println("    return WebAssembly.compile(Uint8Array.from(content));")
	println("  }")
	println("}")

}
