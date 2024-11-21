const fs = require("fs");
const path = require("path");
const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function deleteOldFiles() {
  function getFilesRecursively(dir) {
    let fileList = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Recursively get files from subdirectories
        fileList = fileList.concat(getFilesRecursively(fullPath));
      } else {
        // Add file with its metadata
        fileList.push({ fullPath, time: stats.mtime.getTime() });
      }
    }
    return fileList;
  }

  try {
    const files = getFilesRecursively(saveDirectory);

    if (files.length === 0) {
      console.log("No files to delete.");
      return;
    }

    // Find the oldest file
    const oldestFile = files.reduce((oldest, current) =>
      current.time < oldest.time ? current : oldest
    );

    // Delete the oldest file
    fs.unlinkSync(oldestFile.fullPath);
    console.log(`Deleted oldest file: ${oldestFile.fullPath}`);
  } catch (err) {
    console.error(`Error processing files: ${err.message}`);
  }
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldFiles,
};
