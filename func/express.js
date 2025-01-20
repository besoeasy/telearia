// func/express.js
const express = require("express");
const cors = require("cors");
const serveIndex = require("serve-index");
const path = require("path");

const {
  getVideoFiles,
  generateSHA256Hash,
  teleariaPort,
  teleariaURL,
} = require("./utils.js");

const app = express();

const { saveDirectory } = require("./utils.js");

app.use(cors());

app.use(
  "/",
  express.static(saveDirectory),
  serveIndex(saveDirectory, {
    icons: true, // Show icons
    view: "details", // Detailed view
  })
);

app.get("/manifest.json", (req, res) => {
  res.json({
    id: "com.besoeasy.telearia",
    version: "1.1.0",
    name: "TeleAria",
    description: "A Stremio add-on for browsing and playing downloaded videos",
    catalogs: [
      {
        type: "movie",
        id: "telearia-downloads",
        name: "TeleAria Downloads",
      },
    ],
    resources: [
      {
        name: "stream",
        types: ["movie", "series", "anime"],
      },
      {
        name: "catalog",
        types: ["movie", "series", "anime"],
      },
      {
        name: "meta",
        types: ["movie", "series", "anime"],
        idPrefixes: ["telearia_"],
      },
    ],
    types: ["movie", "series", "anime"],
    background:
      "https://ipfs.io/ipfs/QmPPCUJei6hWybisHTvfQL4F1pA3U2PtKaeF2JLRzUXhwB",
    logo: "https://ipfs.io/ipfs/QmXjdndgYNyMqm42nagYRNK2QGTfyRtR7ZSHj1H9Jy1JiK",
  });
});

app.get("/catalog/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (id !== "telearia-downloads") {
    return res.status(404).json({ error: "Catalog not found" });
  }

  try {
    const videos = getVideoFiles();
    const metas = videos.map((video) => ({
      id: "telearia_" + generateSHA256Hash(video),
      type: type,
      name: path.basename(video, path.extname(video)),
      poster:
        "https://image.pollinations.ai/prompt/" +
        path.basename(video, path.extname(video)),
      background:
        "https://ipfs.io/ipfs/QmRKtCSKBxHodc2GMyqkYqZNbsXETpuKRtmsiP7MryX7Zr",
      description: `Stream your video with TeleAria`,
    }));

    res.json({ metas });
  } catch (error) {
    console.error("Error generating catalog:", error);
    res.status(500).json({ error: "Failed to generate catalog" });
  }
});

app.get("/meta/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (!id.startsWith("telearia")) {
    return res.status(404).json({ error: "Meta not found" });
  }

  try {
    const videos = getVideoFiles();
    const matchedVideo = videos.find(
      (video) => "telearia_" + generateSHA256Hash(video) === id
    );

    if (!matchedVideo) {
      return res.status(404).json({ error: "Meta not found" });
    }

    const meta = {
      id: id,
      type: type,
      name: path.basename(matchedVideo, path.extname(matchedVideo)),
      poster:
        "https://image.pollinations.ai/prompt/" +
        path.basename(matchedVideo, path.extname(matchedVideo)),
      background:
        "https://ipfs.io/ipfs/QmRKtCSKBxHodc2GMyqkYqZNbsXETpuKRtmsiP7MryX7Zr",
      description: path.basename(matchedVideo, path.extname(matchedVideo)),
      videos: [
        {
          id: id,
          title: "Watch Now",
          released: new Date().toISOString(),
          streams: [
            {
              name: "Thru Internet",
              url: `${teleariaURL}/${matchedVideo}`,
            },
            {
              name: "Thru Local (LAN)",
              url: `http://pi.local:6799/${matchedVideo}`,
            },
          ],
        },
      ],
    };

    res.json({ meta });
  } catch (error) {
    console.error("Error generating meta:", error);
    res.status(500).json({ error: "Failed to generate meta" });
  }
});

const startServer = () => {
  app.listen(teleariaPort, () => {});
};

module.exports = startServer;
