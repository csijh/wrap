/* Free and open source: see licence.txt.

Run a node.js web server for local development of a static web site.
Start with "node server.mjs &" and visit the address printed on the console.
There should normally be an index.html file in the current folder. */

// Load the library modules, and define the global constants.
// The port can be changed to the default 80, if there are no privilege issues
// and port number 80 isn't already in use. Define the most common standard
// file extensions. For a more complete list, install the mime module and
// adapt the list it provides.
import http from "http";
import fs from "fs";
const port = 8080;
const OK = 200, NotFound = 404, BadType = 415, Error = 500;
const types = {
    html : "text/html",
    css  : "text/css",
    js   : "application/javascript",
    mjs  : "application/javascript",
    png  : "image/png",
    gif  : "image/gif",
    jpeg : "image/jpeg",
    jpg  : "image/jpeg",
    svg  : "image/svg+xml",
    json : "application/json",
    pdf  : "application/pdf",
    txt  : "text/plain",
    c    : "text/plain",
    h    : "text/plain",
    java : "text/plain",
    ttf  : "application/x-font-ttf",
    woff : "application/font-woff",
    aac  : "audio/aac",
    mp3  : "audio/mpeg",
    mp4  : "video/mp4",
    webm : "video/webm",
    ico  : "image/x-icon", // just for favicon.ico
    makefile : "text/plain",
}

// Start the server. Accept only requests from localhost, for security.
let service = http.createServer(handle);
service.listen(port, "localhost");
let address = "http://localhost";
if (port != 80) address = address + ":" + port;
console.log("Server running at", address);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Shut the server down cleanly.
function shutdown() {
    service.close(process.exit);
};

// Serve a request by delivering a file.
function handle(request, response) {
    let url = request.url;
    if (url.endsWith("/")) url = url + "index.html";
    let type = findType(url);
    if (type == null) return fail(response, BadType, "File type unsupported");
    let file = "." + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Find the content type to respond with, or undefined.
function findType(url) {
    if (url.endsWith("makefile")) return types["makefile"];
    let dot = url.lastIndexOf(".");
    let extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
// Include a length header to allow audio/video to be streamed in a player.
function deliver(response, type, err, content) {
    if (err) return fail(response, NotFound, "File not found");
    let typeHeader = {
        "Content-Type": type,
        "Content-Length": Buffer.byteLength(content)
    };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    let textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}
