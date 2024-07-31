const { saveDirectory } = require("./utils.js");

const { createServer } = require("http");

const handler = require("serve-handler");

const server = createServer((request, response) => {
  handler(request, response, {
    public: saveDirectory,
    rewrites: [{ source: "**", destination: "/index.html" }],
  }).catch((err) => {
    console.error("Error handling request:", err);
    response.statusCode = 500;
    response.end("Internal Server Error");
  });
});

module.exports = {
  server,
};
