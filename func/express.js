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
    background: "https://i.ibb.co/VtSfFP9/t8wVwcg.jpg",
    logo: "https://i.ibb.co/w4BnkC9/GwxAcDV.png",
  });
});

app.get("/catalog/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (id !== "telearia-downloads") {
    return res.status(404).json({ error: "Catalog not found" });
  }

  try {
    const videos = getVideoFiles(); // Fetch list of video files
    const metas = videos.map((video) => ({
      id: "telearia_" + generateSHA256Hash(video), // Unique ID
      type: type,
      name: path.basename(video, path.extname(video)), // Video name without extension
      poster: "https://i.ibb.co/w4BnkC9/GwxAcDV.png", // Default poster
      background: "https://i.ibb.co/VtSfFP9/t8wVwcg.jpg", // Background image
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
      poster: "https://i.ibb.co/w4BnkC9/GwxAcDV.png",
      background: "https://i.ibb.co/VtSfFP9/t8wVwcg.jpg",
      description: `Stream your video with TeleAria.`,
      videos: [
        {
          id: id,
          title: "Watch Now",
          released: new Date().toISOString(),
          streams: [
            {
              name: "TeleAria",
              url: `${teleariaURL}/${matchedVideo}`,
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
