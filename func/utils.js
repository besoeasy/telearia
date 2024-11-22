const fs = require("fs");
const path = require("path");
const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");


let teleariaPort = 6799;
let teleariaURL = "http://localhost:6799"


const crypto = require("crypto");

function generateSHA256Hash(inputString) {
  return crypto.createHash("sha256").update(inputString).digest("hex");
}

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

// List of video file extensions to look for
const videoExtensions = [
  ".mp4",
  ".mkv",
  ".avi",
  ".mov",
  ".flv",
  ".wmv",
  ".webm",
];

function getVideoFiles() {
  const videoFiles = [];

  function searchDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search in subdirectories
        searchDirectory(entryPath);
      } else if (entry.isFile()) {
        // Check if the file has a valid video extension
        const fileExtension = path.extname(entry.name).toLowerCase();
        if (videoExtensions.includes(fileExtension)) {
          // Get the relative path (exclude /tmp/downloads/)
          const relativePath = path.relative(saveDirectory, entryPath);
          videoFiles.push(relativePath);
        }
      }
    }
  }

  try {
    searchDirectory(saveDirectory);
  } catch (error) {
    console.error("Error reading directory:", error.message);
  }

  return videoFiles;
}
function cleanUser(str) {
  return str.toString();
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldFiles,
  getVideoFiles,
  generateSHA256Hash,
  cleanUser,
  teleariaPort,
  teleariaURL
};
