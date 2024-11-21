const { addonBuilder } = require("stremio-addon-sdk");
const fs = require("fs");
const path = require("path");
const os = require("os");

const tempdir = os.tmpdir();
const saveDirectory = path.join(tempdir, "downloads");

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv"];

// Helper to get video files from a directory
function getVideoFiles(dir) {
  let videoFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively get video files from subdirectories
      videoFiles = videoFiles.concat(getVideoFiles(fullPath));
    } else if (VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      // Add video files with their details
      videoFiles.push({
        id: encodeURIComponent(fullPath), // Unique ID for the file
        name: path.basename(file),
        fullPath,
      });
    }
  }

  return videoFiles;
}

// Stremio Addon Definition
const manifest = {
  id: "com.besoeasy.telearia",
  version: "1.0.0",
  name: "Local Video Files",
  description: "Showcases local video files as collections in Stremio",
  resources: ["catalog", "stream"],
  types: ["movie", "series"],
  catalogs: [
    {
      type: "movie",
      id: "local-videos",
      name: "Local Videos",
    },
  ],
};

// Function to create and return the Stremio Addon
function createStremioAddon() {
  const builder = new addonBuilder(manifest);

  // Provide catalog of video files
  builder.defineCatalogHandler((args) => {
    if (args.type === "movie" && args.id === "local-videos") {
      const videoFiles = getVideoFiles(saveDirectory);
      const metas = videoFiles.map((file) => ({
        id: file.id,
        name: file.name,
        type: "movie",
        poster: "https://via.placeholder.com/300x450?text=Telearia", // Placeholder image
      }));

      return Promise.resolve({ metas });
    }

    return Promise.resolve({ metas: [] });
  });

  // Provide stream for a specific video
  builder.defineStreamHandler((args) => {
    const decodedId = decodeURIComponent(args.id);
    const filePath = path.resolve(decodedId);

    if (fs.existsSync(filePath)) {
      return Promise.resolve({
        streams: [
          {
            title: "Play Video",
            url: `file://${filePath}`, // Local file URL
          },
        ],
      });
    }

    return Promise.resolve({ streams: [] });
  });

  return builder;
}

module.exports = createStremioAddon;
