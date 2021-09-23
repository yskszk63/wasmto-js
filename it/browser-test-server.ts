const srv = Deno.listen({ port: 8080 });
for await (const conn of srv) {
  for await (const evt of Deno.serveHttp(conn)) {
    const path = new URL(evt.request.url).pathname;
    switch (path) {
    case '/':
      evt.respondWith(new Response(Deno.readTextFileSync(new URL("./browser-test.html", import.meta.url)), {
        headers: {
          'Content-Type': 'text/html',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      }));
      break;

    case '/node-test.mjs':
      evt.respondWith(new Response(Deno.readTextFileSync(new URL("./node-test.mjs", import.meta.url)), {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }));
      break;

    case '/example.wasm.js':
      evt.respondWith(new Response(Deno.readTextFileSync(new URL("./example.wasm.js", import.meta.url)), {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }));
      break;
    }
  }
}
