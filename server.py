from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 4173

handler = SimpleHTTPRequestHandler
handler.extensions_map.update({
    ".js": "text/javascript",
    ".css": "text/css",
    ".webmanifest": "application/manifest+json",
})

server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
print(f"Slavikus Sport is running at http://127.0.0.1:{PORT}")
server.serve_forever()
