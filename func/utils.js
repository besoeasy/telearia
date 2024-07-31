function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const path = require("path");

const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");

const aria2server = process.env.ARIA2_SERVER || "http://localhost:6800/jsonrpc";

module.exports = {
  bytesToSize,
  saveDirectory,
  aria2server,
};
