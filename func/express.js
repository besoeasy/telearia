const express = require("express");
const cors = require("cors");
const serveIndex = require("serve-index");
const path = require("path");

const {
  getVideoFiles,
  generateSHA256Hash,
  teleariaPort,
  teleariaURL,
  saveDirectory,
} = require("./utils.js");

const app = express();

// Middleware
app.use(cors());
app.use(
  "/",
  express.static(saveDirectory),
  serveIndex(saveDirectory, { icons: true, view: "details" })
);

// Stremio Manifest
app.get("/manifest.json", (req, res) => {
  res.json({
    id: "com.besoeasy.telearia",
    version: "1.1.0",
    name: "TeleAria",
    description: "Browse and stream your downloaded videos with TeleAria",
    catalogs: [{ type: "movie", id: "telearia-downloads", name: "TeleAria Downloads" }],
    resources: [
      { name: "stream", types: ["movie", "series", "anime"] },
      { name: "catalog", types: ["movie", "series", "anime"] },
      { name: "meta", types: ["movie", "series", "anime"], idPrefixes: ["telearia_"] },
    ],
    types: ["movie", "series", "anime"],
    background: "https://ipfs.io/ipfs/QmPPCUJei6hWybisHTvfQL4F1pA3U2PtKaeF2JLRzUXhwB",
    logo: "https://ipfs.io/ipfs/QmXjdndgYNyMqm42nagYRNK2QGTfyRtR7ZSHj1H9Jy1JiK",
  });
});

// Catalog Endpoint
app.get("/catalog/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (id !== "telearia-downloads") {
    return res.status(404).json({ error: "Catalog not found" });
  }

  try {
    const videos = getVideoFiles();
    const metas = videos.map((video) => {
      const name = path.basename(video, path.extname(video));
      return {
        id: `telearia_${generateSHA256Hash(video)}`,
        type,
        name,
        poster: `https://image.pollinations.ai/prompt/${encodeURIComponent(name)}`,
        background: "https://ipfs.io/ipfs/QmRKtCSKBxHodc2GMyqkYqZNbsXETpuKRtmsiP7MryX7Zr",
        description: "Stream your downloaded video via TeleAria",
      };
    });

    res.json({ metas });
  } catch (error) {
    console.error("Catalog error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Meta Endpoint
app.get("/meta/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (!id.startsWith("telearia_")) {
    return res.status(404).json({ error: "Meta not found" });
  }

  try {
    const videos = getVideoFiles();
    const matchedVideo = videos.find(
      (video) => `telearia_${generateSHA256Hash(video)}` === id
    );

    if (!matchedVideo) {
      return res.status(404).json({ error: "Video not found" });
    }

    const name = path.basename(matchedVideo, path.extname(matchedVideo));
    res.json({
      id,
      type,
      name,
      poster: `https://image.pollinations.ai/prompt/${encodeURIComponent(name)}`,
      background: "https://ipfs.io/ipfs/QmRKtCSKBxHodc2GMyqkYqZNbsXETpuKRtmsiP7MryX7Zr",
      description: name,
      videos: [
        {
          id,
          title: "Watch Now",
          released: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
          streams: [
            { name: "Internet", url: `${teleariaURL}/${matchedVideo}` },
            { name: "Local (LAN)", url: `http://pi.local:6799/${matchedVideo}` },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Meta error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const startServer = () => {
  app.listen(teleariaPort, () => {
    console.log(`TeleAria server running on port ${teleariaPort}`);
  }).on("error", (err) => {
    console.error("Server startup error:", err.message);
  });
};

module.exports = startServer;
