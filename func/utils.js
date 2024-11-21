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

function deleteOldFiles(ctx) {
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

  function removeEmptyFoldersRecursively(folder) {
    const files = fs.readdirSync(folder);
    if (files.length > 0) {
      files.forEach((file) => {
        const fullPath = path.join(folder, file);
        if (fs.statSync(fullPath).isDirectory()) {
          removeEmptyFoldersRecursively(fullPath);
        }
      });
    }

    // If the folder is empty after processing, delete it
    if (fs.readdirSync(folder).length === 0) {
      fs.rmdirSync(folder);
      console.log(`Deleted empty folder: ${folder}`);
      ctx.reply(`Deleted empty folder: ${folder}`);
    }
  }

  try {
    const files = getFilesRecursively(saveDirectory);

    if (files.length === 0) {
      console.log("No files to delete.");
      ctx.reply("No files to delete.");
      return;
    }

    // Sort files by modification time (oldest first)
    files.sort((a, b) => a.time - b.time);

    // Delete the oldest file
    const oldestFile = files[0];
    fs.unlinkSync(oldestFile.fullPath);
    console.log(`Deleted oldest file: ${oldestFile.fullPath}`);
    ctx.reply(`Deleted oldest file: ${oldestFile.fullPath}`);

    // Remove any empty folders in the directory tree
    removeEmptyFoldersRecursively(saveDirectory);
  } catch (err) {
    console.error(`Error processing files: ${err.message}`);
  }
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldFiles,
};
