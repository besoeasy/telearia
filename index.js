#!/usr/bin/env node

require("dotenv").config();

const { version } = require("./package.json");
const {
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
} = require("./func/aria2.js");

const { getIpData } = require("./func/ip.js");

const {
  bytesToSize,
  deleteOldFiles,
  getVideoFiles,
} = require("./func/utils.js");

const { Telegraf } = require("telegraf");

const downloadUrl = process.env.TUNNELURL || "http://pi.local:6799";

if (!process.env.TELEGRAMBOT) {
  console.error("Error: TELEGRAMBOT Environment Variable is not set.");
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAMBOT);

function cleanUser(str) {
  return str.toString();
}

const commands = [
  "/about - Learn more about this bot",
  "/start - Get started and see available options",
  "/stats - View global download and upload statistics",
  "/download <url> - Start a new download with a specified URL",
  "/downloading - Check the progress of ongoing downloads",
  "/status_<gid> - Get the status of a specific download (use the GID)",
  "/cancel_<gid> - Cancel a specific download (use the GID)",
  "/ip - Display server IP information",
  "/clean - Remove oldest downloaded file",
];

const handleAbout = (ctx) => {
  ctx.reply("GitHub Repo: TeleAria (https://github.com/besoeasy/telearia)");
};

const handleStart = (ctx) => {
  const userIdHash = cleanUser(ctx.chat.id);
  ctx.reply(
    `Welcome to TeleAria! 🎉\n\n` +
      `Version: ${version}\n` +
      `User ID: ${userIdHash}\n` +
      `Your Downloads: Manage here at ${downloadUrl}/${userIdHash}/\n\n` +
      `Available Commands:\n` +
      commands.map((cmd) => `- ${cmd}`).join("\n")
  );
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();
    ctx.reply(
      `Global Stats:\n\n` +
        `Download Speed: ${bytesToSize(stats.downloadSpeed)}\n` +
        `Upload Speed: ${bytesToSize(stats.uploadSpeed)}\n` +
        `Active Downloads: ${stats.numActive}\n` +
        `Waiting Downloads: ${stats.numWaiting}\n` +
        `Stopped Downloads: ${stats.numStopped}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve stats. Please try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const userIdHash = cleanUser(ctx.chat.id);
    const downloadData = await downloadAria(userIdHash, url);
    const downloadId = downloadData.result;

    ctx.reply(
      `Track progress with /status_${downloadId} or view all downloads with /downloading`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to start download. Please try again later.");
  }
};

const handleStatus = async (ctx, downloadId) => {
  try {
    const downloadData = await getDownloadStatus(downloadId);
    const completedSize = (
      downloadData.result.completedLength /
      1024 /
      1024
    ).toFixed(2);
    const totalSize = (downloadData.result.totalLength / 1024 / 1024).toFixed(
      2
    );

    let reply =
      `Download Status:\n\nStatus: ${downloadData.result.status}\n` +
      `Progress: ${completedSize} MB / ${totalSize} MB`;

    if (downloadData.result.status === "active") {
      reply += `\nCancel with /cancel_${downloadId}`;
    } else if (downloadData.result.status === "complete") {
      const files = downloadData.result.files
        .map((file) => file.path)
        .join("\n");
      reply += `\nDownloaded Files:\n${files}`;
    }

    ctx.reply(reply);
  } catch (error) {
    console.error(error);
    ctx.reply(
      `Failed to retrieve status for download ID: ${downloadId}. Please try again later.`
    );
  }
};

const handleCancel = async (ctx, downloadId) => {
  try {
    await cancelDownload(downloadId);
    ctx.reply(`Download with ID ${downloadId} canceled successfully.`);
  } catch (error) {
    console.error(error);
    ctx.reply(
      `Failed to cancel download with ID: ${downloadId}. Please try again later.`
    );
  }
};

const handleIpData = async (ctx) => {
  try {
    const ipData = await getIpData();
    ctx.reply(
      `Server IP Information:\n\n` +
        `IP: ${ipData.query}\n` +
        `Country: ${ipData.country}\n` +
        `Region: ${ipData.regionName}\n` +
        `City: ${ipData.city}\n` +
        `ISP: ${ipData.isp}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve IP data. Please try again later.");
  }
};

const downloading = async (ctx) => {
  try {
    const { result: ongoingDownloads } = await getOngoingDownloads();

    if (ongoingDownloads.length > 0) {
      let reply = "Ongoing Downloads:\n\n";

      for (const download of ongoingDownloads) {
        const { gid, completedLength, totalLength, status } = download;

        const downloadedSize = (completedLength / 1024 / 1024).toFixed(2);
        const totalSize = (totalLength / 1024 / 1024).toFixed(2);
        const progress = ((completedLength / totalLength) * 100).toFixed(2);

        reply += `ID: /status_${gid}\n`;
        reply += `Status: ${status}\n`;
        reply += `Progress: ${downloadedSize} MB / ${totalSize} MB (${progress}%)\n`;
        reply += `-----------------------------\n\n`;
      }

      ctx.reply(reply);
    } else {
      ctx.reply("No ongoing downloads.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve ongoing downloads. Please try again later.");
  }
};

const handleClean = (ctx) => {
  try {
    deleteOldFiles(ctx);
  } catch (error) {
    console.error("Error during file cleanup:", error);
  }
};

// Message handler
bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map((arg) => arg.trim());

      console.log(`@${ctx.from.username} (ID: ${ctx.from.id}): ${text}`);

      switch (lowerCaseCommand) {
        case "/clean":
          handleClean(ctx);
          break;
        case "/about":
          handleAbout(ctx);
          break;
        case "/start":
          handleStart(ctx);
          break;
        case "/stats":
          handleStats(ctx);
          break;
        case "/downloading":
          downloading(ctx);
          break;
        case "/ip":
          handleIpData(ctx);
          break;
        case "/download":
        case "/dl":
          if (trimmedArgs.length > 0) handleDownload(ctx, trimmedArgs[0]);
          else ctx.reply("Please provide a URL to download.");
          break;
        default:
          if (lowerCaseCommand.startsWith("/status_"))
            handleStatus(ctx, lowerCaseCommand.split("_")[1]);
          else if (lowerCaseCommand.startsWith("/cancel_"))
            handleCancel(ctx, lowerCaseCommand.split("_")[1]);
          else
            ctx.reply(
              `Unknown command: ${lowerCaseCommand}\n\nType /start to see available commands.`
            );
      }
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred. Please try again later.");
    }
  }
});

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

bot.launch();

process.once("SIGINT", () => {
  console.log("SIGINT received. Exiting...");
  bot.stop("SIGINT");
  process.exit();
});

const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();

// Helpers
function generateSHA256Hash(inputString) {
  return crypto.createHash("sha256").update(inputString).digest("hex");
}

// Middleware
app.use(cors());
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// Manifest Endpoint
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

// Catalog Endpoint
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
      description: `Stream your video with TeleAria.`,
    }));

    res.json({ metas });
  } catch (error) {
    console.error("Error generating catalog:", error);
    res.status(500).json({ error: "Failed to generate catalog" });
  }
});

// Meta Endpoint
app.get("/meta/:type/:id.json", (req, res) => {
  const { type, id } = req.params;

  if (!id.startsWith("telearia")) {
    return res.status(404).json({ error: "Meta not found" });
  }

  try {
    const videos = getVideoFiles(); // Fetch video files
    const matchedVideo = videos.find(
      (video) => "telearia_" + generateSHA256Hash(video) === id
    );

    if (!matchedVideo) {
      return res.status(404).json({ error: "Meta not found" });
    }

    const meta = {
      id: id,
      type: type,
      name: path.basename(matchedVideo, path.extname(matchedVideo)), // Video name without extension
      poster: "https://i.ibb.co/w4BnkC9/GwxAcDV.png", // Default poster
      background: "https://i.ibb.co/VtSfFP9/t8wVwcg.jpg", // Background image
      description: `Stream your video with TeleAria.`,
      videos: [
        {
          id: id,
          title: "Watch Now",
          released: new Date().toISOString(),
          streams: [
            {
              name: "TeleAria",
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

app.listen(6798, () => {
  console.log("Server is running on port 6798");
});
