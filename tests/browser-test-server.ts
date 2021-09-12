const srv = Deno.listen({ port: 8080 });
for await (const conn of srv) {
  for await (const evt of Deno.serveHttp(conn)) {
    const path = new URL(evt.request.url).pathname;
    switch (path) {
    case '/':
      evt.respondWith(new Response(Deno.readTextFileSync("./tests/browser-test.html"), {
        headers: {
          'Content-Type': 'text/html',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      }));
      break;

    case '/node-test.mjs':
      evt.respondWith(new Response(Deno.readTextFileSync("./tests/node-test.mjs"), {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }));
      break;

    case '/example.mjs':
      evt.respondWith(new Response(Deno.readTextFileSync("./tests/example.mjs"), {
        headers: {
          'Content-Type': 'application/javascript',
        },
      }));
      break;
    }
  }
}
