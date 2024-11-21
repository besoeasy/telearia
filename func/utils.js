const fs = require("fs");
const path = require("path");
const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");

function deleteOldestFile() {
  fs.readdir(saveDirectory, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err.message}`);
      return;
    }

    if (files.length === 0) {
      console.log("No files to delete.");
      return;
    }

    const filePaths = files.map((file) => ({
      name: file,
      fullPath: path.join(saveDirectory, file),
      time: fs.statSync(path.join(saveDirectory, file)).mtime.getTime(),
    }));

    const oldestFile = filePaths.reduce((oldest, current) => {
      return current.time < oldest.time ? current : oldest;
    });

    fs.unlink(oldestFile.fullPath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err.message}`);
      } else {
        console.log(`Deleted oldest file: ${oldestFile.name}`);
      }
    });
  });
}

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldestFile,
};
