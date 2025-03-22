const fs = require("fs").promises; // Use promises for async operations
const path = require("path");
const os = require("os");
const crypto = require("crypto");

// Constants
const SAVE_DIR = path.join(os.tmpdir(), "downloads");
const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".webm"];
const TELEARIA_PORT = 6799;
const TELEARIA_URL = process.env.TUNNELURL || `http://localhost:${TELEARIA_PORT}`;

// Ensure save directory exists
async function ensureSaveDir() {
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create save directory:", error.message);
  }
}

/**
 * Converts bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.23 MB")
 */
function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

/**
 * Generates SHA256 hash of a string
 * @param {string} input - Input string to hash
 * @returns {string} Hexadecimal hash
 */
function generateSHA256Hash(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Deletes the oldest file and empty folders in save directory
 * @param {Object} ctx - Telegram context for replies
 */
async function deleteOldFiles(ctx) {
  try {
    const files = await getFilesRecursively(SAVE_DIR);
    if (!files.length) {
      console.log("No files to delete.");
      return ctx.reply("No files to delete.");
    }

    // Sort by modification time (oldest first)
    files.sort((a, b) => a.mtime - b.mtime);
    const oldestFile = files[0];

    await fs.unlink(oldestFile.path);
    console.log(`Deleted: ${oldestFile.path}`);
    ctx.reply(`Deleted: ${path.basename(oldestFile.path)}`);

    await removeEmptyFolders(SAVE_DIR);
  } catch (error) {
    console.error("Error deleting files:", error.message);
    ctx.reply("Failed to delete files.");
  }
}

/**
 * Recursively gets files with modification times
 * @param {string} dir - Directory to scan
 * @returns {Array} List of { path, mtime } objects
 */
async function getFilesRecursively(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFilesRecursively(fullPath)));
    } else if (entry.isFile()) {
      const { mtimeMs } = await fs.stat(fullPath);
      files.push({ path: fullPath, mtime: mtimeMs });
    }
  }
  return files;
}

/**
 * Recursively removes empty directories
 * @param {string} dir - Directory to clean
 */
async function removeEmptyFolders(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) await removeEmptyFolders(fullPath);
  }

  const isEmpty = (await fs.readdir(dir)).length === 0;
  if (isEmpty) {
    await fs.rmdir(dir);
    console.log(`Removed empty folder: ${dir}`);
  }
}

/**
 * Retrieves video files from save directory
 * @returns {string[]} Array of relative video file paths
 */
async function getVideoFiles() {
  const videoFiles = [];

  async function scanDir(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          videoFiles.push(path.relative(SAVE_DIR, fullPath));
        }
      }
    }
  }

  try {
    await ensureSaveDir(); // Ensure directory exists before scanning
    await scanDir(SAVE_DIR);
  } catch (error) {
    console.error("Error scanning videos:", error.message);
  }
  return videoFiles;
}

/**
 * Sanitizes user ID to string
 * @param {any} input - User ID input
 * @returns {string} Cleaned string
 */
function cleanUser(input) {
  return String(input);
}

// Initialize save directory on module load
ensureSaveDir();

module.exports = {
  bytesToSize,
  saveDirectory: SAVE_DIR,
  deleteOldFiles,
  getVideoFiles,
  generateSHA256Hash,
  cleanUser,
  teleariaPort: TELEARIA_PORT,
  teleariaURL: TELEARIA_URL,
};
