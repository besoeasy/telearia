#!/usr/bin/env node

require("dotenv").config();

const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const axios = require("axios");

const { Telegraf } = require("telegraf");
const { version } = require("./package.json");

const SAVE_DIR = path.join(os.tmpdir(), "telearia");
const TELEARIA_PORT = 6799;

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function deleteOldFiles(ctx) {
  try {
    const files = await getFilesRecursively(SAVE_DIR);
    if (!files.length) {
      console.log("No files to delete.");
      return ctx.reply("No files to delete.");
    }
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

function cleanUser(input) {
  return String(input);
}

async function getIpData() {
  try {
    const { data } = await axios.get("http://ip-api.com/json/");

    if (data.status === "fail") {
      throw new Error(data.message || "IP API request failed");
    }
    return {
      query: data.query,
      country: data.country,
      regionName: data.regionName,
      city: data.city,
      isp: data.isp,
    };
  } catch (error) {
    console.error("Failed to fetch IP data:", error.message);
    return null;
  }
}

const axiosPost = async (method, params = []) => {
  const { data } = await axios.post("http://localhost:6398/jsonrpc", {
    jsonrpc: "2.0",
    method,
    id: 1,
    params,
  });
  return data;
};

const getGlobalStats = async () => {
  return await axiosPost("aria2.getGlobalStat");
};

const downloadAria = async (id, url) => {
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const downloadDir = path.join(SAVE_DIR, id, currentDate);
  return await axiosPost("aria2.addUri", [
    [url],
    {
      dir: downloadDir,
    },
  ]);
};

const getDownloadStatus = async (gid) => {
  return await axiosPost("aria2.tellStatus", [gid]);
};

const getOngoingDownloads = async () => {
  return await axiosPost("aria2.tellActive");
};

const cancelDownload = async (gid) => {
  return await axiosPost("aria2.remove", [gid]);
};

const commands = [
  "/about - Learn more about TeleAria",
  "/start - Begin your download journey",
  "/stats - Check global download stats",
  "/download <url> - Start downloading a file",
  "/downloading - View active downloads",
  "/find <imdb_url_or_id> - Search torrents by IMDb ID or URL",
  "/status_<gid> - Check a specific download",
  "/cancel_<gid> - Stop a specific download",
  "/ip - Show server IP details",
  "/clean - Remove oldest downloaded file",
];

function getImdbId(url) {
  const match = url.match(/(tt\d{7,8})/);
  return match ? match[1] : null;
}

async function fetchTorrent(contentid) {
  const urltype = contentid.includes(":") ? "series" : "movie";
  const response = await axios.get(
    "https://torrentio.strem.fun/sort=seeders" +
      "/stream/" +
      urltype +
      "/" +
      contentid +
      ".json",
    { timeout: 2000 }
  );
  const torrentdatafinal = response.data.streams;
  const torrents = [];
  for (let i = 0; i < torrentdatafinal.length; i++) {
    torrents.push({
      title: torrentdatafinal[i].title,
      magnet: "magnet:?xt=urn:btih:" + torrentdatafinal[i].infoHash,
      fileIdx: torrentdatafinal[i].fileIdx || 0,
    });
  }
  return torrents;
}

// Command handlers
const handleAbout = (ctx) => {
  ctx.reply(
    "TeleAria - Telegram-controlled cloud downloader\nGitHub: https://github.com/besoeasy/telearia"
  );
};

const handleStart = (ctx) => {
  const userIdHash = cleanUser(ctx.chat.id);

  ctx.reply(
    "TeleAria\n\n" +
      `Bot Version: ${version}\n` +
      `Server Port: ${TELEARIA_PORT}\n` +
      `Your User ID: ${userIdHash}\n\n` +
      "Commands:\n" +
      commands.join("\n")
  );
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();
    ctx.reply(
      "Global Statistics\n" +
        `Download Speed: ${bytesToSize(stats.downloadSpeed)}/s\n` +
        `Upload Speed: ${bytesToSize(stats.uploadSpeed)}/s\n` +
        `Active: ${stats.numActive}\n` +
        `Waiting: ${stats.numWaiting}\n` +
        `Stopped: ${stats.numStopped}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Could not fetch stats. Try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const userIdHash = cleanUser(ctx.chat.id);
    const downloadData = await downloadAria(userIdHash, url);
    const downloadId = downloadData.result;
    ctx.reply(
      "Download started\n" +
        `Track: /status_${downloadId}\n` +
        "See all: /downloading"
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to start download. Try again.");
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
    const percent = ((completedSize / totalSize) * 100).toFixed(1);
    let reply =
      `Download Status\n` +
      `Status: ${downloadData.result.status}\n` +
      `Progress: ${completedSize} MB / ${totalSize} MB (${percent}%)\n`;
    if (downloadData.result.status === "active") {
      reply += `Cancel: /cancel_${downloadId}\n`;
    }
    const files = downloadData.result.files
      .map((file) => `File: ${file.path}`)
      .join("\n");
    reply += `\nFiles:\n${files}`;
    ctx.reply(reply);
  } catch (error) {
    console.error(error);
    ctx.reply(`Could not get status for ${downloadId}. Try again later.`);
  }
};

const handleCancel = async (ctx, downloadId) => {
  try {
    await cancelDownload(downloadId);
    ctx.reply(`Download ${downloadId} canceled.`);
  } catch (error) {
    console.error(error);
    ctx.reply(`Failed to cancel ${downloadId}. Try again later.`);
  }
};

const handleIpData = async (ctx) => {
  try {
    const ipData = await getIpData();
    ctx.reply(
      "Server IP Info\n" +
        `IP: ${ipData.query}\n` +
        `Country: ${ipData.country}\n` +
        `Region: ${ipData.regionName}\n` +
        `City: ${ipData.city}\n` +
        `ISP: ${ipData.isp}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Could not fetch IP info. Try again later.");
  }
};

const handleClean = (ctx) => {
  try {
    deleteOldFiles(ctx);
    ctx.reply("Cleaning up old files...");
  } catch (error) {
    console.error("Error during file cleanup:", error);
    ctx.reply("Cleanup failed. Try again later.");
  }
};

const handleFind = async (ctx, imdbInput) => {
  try {
    const imdbId = getImdbId(imdbInput);
    if (!imdbId) {
      ctx.reply("Please provide a valid IMDb URL or IMDb ID (e.g. tt1234567)");
      return;
    }
    ctx.reply("Searching torrents for " + imdbId + "...");
    const torrents = await fetchTorrent(imdbId);
    if (!torrents.length) {
      ctx.reply("No torrents found for this IMDb ID.");
      return;
    }
    torrents.slice(0, 20).forEach((t, i) => {
      ctx.reply(`${t.title}\n\n${t.magnet}`);
    });
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to fetch torrents. Try again later.");
  }
};

const downloading = async (ctx) => {
  try {
    const { result: ongoingDownloads } = await getOngoingDownloads();
    if (ongoingDownloads.length > 0) {
      let reply = "Ongoing Downloads\n";
      for (const download of ongoingDownloads) {
        const { gid, completedLength, totalLength, status } = download;
        const downloadedSize = (completedLength / 1024 / 1024).toFixed(2);
        const totalSize = (totalLength / 1024 / 1024).toFixed(2);
        const progress = ((completedLength / totalLength) * 100).toFixed(1);

        reply += `ID: /status_${gid}\n`;
        reply += `Status: ${status}\n`;
        reply += `Progress: ${downloadedSize} MB / ${totalSize} MB (${progress}%)\n\n\n`;
      }
      ctx.reply(reply);
    } else {
      ctx.reply("No ongoing downloads.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to fetch downloads. Try again later.");
  }
};

// Main Bot Logic
if (!process.env.TELEGRAMBOT) {
  console.error("TELEGRAMBOT Environment Variable is not set!");
  process.exit(1);
}

const whiteListSet = new Set();
const isWhitelistEnabled = !!process.env.WHITE_LIST_USER;

if (isWhitelistEnabled) {
  const userIds = process.env.WHITE_LIST_USER.split(",");
  userIds.map((id) => whiteListSet.add(id));
  console.log("Whitelist enabled with users:", [...whiteListSet]);
} else {
  console.log("Whitelist disabled - Bot available to all users");
}

const bot = new Telegraf(process.env.TELEGRAMBOT);

bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map((arg) => arg.trim());

      if (isWhitelistEnabled && !whiteListSet.has(ctx.from.id + "")) {
        ctx.reply(
          `@${ctx.from.username} (ID: ${ctx.from.id}): is not available!`
        );
        return;
      }

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
        case "/find":
          if (trimmedArgs.length > 0) handleFind(ctx, trimmedArgs[0]);
          else ctx.reply("Please provide an IMDb URL or IMDb ID.");
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

try {
  bot.launch();
} catch (error) {
  console.error("Error launching bot:", error);
}
