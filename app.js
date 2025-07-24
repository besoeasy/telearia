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

// Default fallback trackers (your current list)
const DEFAULT_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "http://tracker.opentrackr.org:1337/announce",
  "udp://open.demonii.com:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://exodus.desync.com:6969/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://explodie.org:6969/announce",
  "udp://tracker.theoks.net:6969/announce",
  "udp://tracker.srv00.com:6969/announce",
  "udp://tracker-udp.gbitt.info:80/announce",
  "udp://opentracker.io:6969/announce",
  "udp://open.free-tracker.ga:6969/announce",
  "udp://ns-1.x-fins.com:6969/announce",
  "udp://leet-tracker.moe:1337/announce",
  "udp://bt.ktrackers.com:6666/announce",
  "http://www.torrentsnipe.info:2701/announce",
  "http://www.genesis-sp.org:2710/announce",
  "http://tracker1.bt.moack.co.kr:80/announce",
  "http://tracker.lintk.me:2710/announce",
  "http://tracker.dmcomic.org:2710/announce",
  "http://tracker.corpscorp.online:80/announce",
  "http://tracker.bt-hash.com:80/announce",
  "http://open.trackerlist.xyz:80/announce",
  "http://finbytes.org:80/announce.php",
  "http://bt.poletracker.org:2710/announce",
  "udp://wepzone.net:6969/announce",
  "udp://ttk2.nbaonlineservice.com:6969/announce",
  "udp://tracker2.dler.org:80/announce",
  "udp://tracker1.myporn.club:9337/announce",
  "udp://tracker.tryhackx.org:6969/announce",
  "udp://tracker.therarbg.to:6969/announce",
  "udp://tracker.ololosh.space:6969/announce",
  "udp://tracker.gmi.gd:6969/announce",
  "udp://tracker.gigantino.net:6969/announce",
  "udp://tracker.filemail.com:6969/announce",
  "udp://tracker.dler.org:6969/announce",
  "udp://tracker.darkness.services:6969/announce",
  "udp://tracker.bittor.pw:1337/announce",
  "udp://tr4ck3r.duckdns.org:6969/announce",
  "udp://t.overflow.biz:6969/announce",
  "udp://retracker01-msk-virt.corbina.net:80/announce",
  "udp://retracker.lanta.me:2710/announce",
  "udp://public.tracker.vraphim.com:6969/announce",
  "udp://p4p.arenabg.com:1337/announce",
  "udp://p2p.publictracker.xyz:6969/announce",
  "udp://open.dstud.io:6969/announce",
  "udp://martin-gebhardt.eu:25/announce",
  "udp://isk.richardsw.club:6969/announce",
  "udp://ipv4announce.sktorrent.eu:6969/announce",
  "udp://discord.heihachi.pw:6969/announce",
  "udp://d40969.acod.regrucolo.ru:6969/announce",
  "udp://bittorrent-tracker.e-n-c-r-y-p-t.net:1337/announce",
  "udp://bandito.byterunner.io:6969/announce",
  "udp://1c.premierzal.ru:6969/announce"
];

// Cache for fetched trackers
let cachedTrackers = null;
let lastTrackerFetch = 0;
const TRACKER_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

async function fetchLatestTrackers() {
  const now = Date.now();
  
  // Return cached trackers if still valid
  if (cachedTrackers && (now - lastTrackerFetch) < TRACKER_CACHE_DURATION) {
    console.log("Using cached trackers");
    return cachedTrackers;
  }

  const trackerSources = [
    "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt",
    "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt",
    "https://newtrackon.com/api/stable",
    "https://raw.githubusercontent.com/XIU2/TrackersListCollection/master/best.txt"
  ];

  console.log("Fetching latest tracker lists...");
  
  for (const source of trackerSources) {
    try {
      const response = await axios.get(source, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'TeleAria/1.0'
        }
      });
      
      if (response.data) {
        const trackers = response.data
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#') && (line.startsWith('udp://') || line.startsWith('http://') || line.startsWith('https://')))
          .slice(0, 50); // Limit to first 50 trackers for performance
        
        if (trackers.length > 0) {
          console.log(`Successfully fetched ${trackers.length} trackers from ${source}`);
          cachedTrackers = trackers;
          lastTrackerFetch = now;
          return trackers;
        }
      }
    } catch (error) {
      console.log(`Failed to fetch trackers from ${source}:`, error.message);
      continue;
    }
  }
  
  console.log("All tracker sources failed, using default trackers");
  cachedTrackers = DEFAULT_TRACKERS;
  lastTrackerFetch = now;
  return DEFAULT_TRACKERS;
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
  
  const options = {
    dir: downloadDir,
  };
  
  // Add dynamic trackers for magnet links and torrents
  if (url.startsWith('magnet:') || url.endsWith('.torrent')) {
    try {
      const trackers = await fetchLatestTrackers();
      options['bt-tracker'] = trackers.join(',');
      console.log(`Using ${trackers.length} trackers for download`);
    } catch (error) {
      console.error('Failed to fetch trackers, proceeding without custom trackers:', error.message);
    }
  }
  
  return await axiosPost("aria2.addUri", [
    [url],
    options,
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
  "/smb - Show SMB credentials",
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

async function getSmbCredentials() {
  try {
    const credentials = await fs.readFile('/var/run/smb_credentials.txt', 'utf8');
    const [username, password] = credentials.trim().split(':');
    return { username, password };
  } catch (error) {
    console.error('Failed to read SMB credentials:', error.message);
    return null;
  }
}

const handleStart = async (ctx) => {
  const userIdHash = cleanUser(ctx.chat.id);
  const smbCreds = await getSmbCredentials();

  let message = "TeleAria\n\n" +
    `Bot Version: ${version}\n` +
    `Server Port: ${TELEARIA_PORT}\n` +
    `Your User ID: ${userIdHash}\n\n`;

  if (smbCreds) {
    message += `📁 SMB Access:\n` +
      `• Read-only: smb://server/telearia (no login)\n` +
      `• Full access: smb://server/telearia-rw\n` +
      `  Username: ${smbCreds.username}\n` +
      `  Password: ${smbCreds.password}\n\n`;
  }

  message += "Commands:\n" + commands.join("\n");
  
  ctx.reply(message);
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

const handleDownload = async (ctx, input) => {
  try {
    const userIdHash = cleanUser(ctx.chat.id);
    let magnet = null;
    let url = null;

    // Magnet link detection
    if (typeof input === "string") {
      const magnetMatch = input.match(/magnet:\?xt=urn:btih:[a-zA-Z0-9]+[^"]*/);
      if (magnetMatch) {
        magnet = magnetMatch[0];
      } else {
        // URL detection (http/https)
        const urlMatch = input.match(/https?:\/\/[\w\-\.\/?#&=:%]+/);
        if (urlMatch) {
          url = urlMatch[0];
        }
      }
    }

    if (magnet) {
      const downloadData = await downloadAria(userIdHash, magnet);
      const downloadId = downloadData.result;
      ctx.reply(
        "Magnet download started\n" +
          `Track: /status_${downloadId}\n` +
          "See all: /downloading"
      );
    } else if (url) {
      const downloadData = await downloadAria(userIdHash, url);
      const downloadId = downloadData.result;
      ctx.reply(
        "URL download started\n" +
          `Track: /status_${downloadId}\n` +
          "See all: /downloading"
      );
    } else {
      ctx.reply("No valid magnet link or URL found in your input.");
    }
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

const handleSmb = async (ctx) => {
  try {
    const smbCreds = await getSmbCredentials();
    if (smbCreds) {
      ctx.reply(
        `📁 SMB File Access\n\n` +
        `Read-only share (no login):\n` +
        `smb://your-server/telearia\n\n` +
        `Full access share:\n` +
        `smb://your-server/telearia-rw\n` +
        `Username: ${smbCreds.username}\n` +
        `Password: ${smbCreds.password}\n\n` +
        `💡 Use with VLC, file managers, or any SMB client`
      );
    } else {
      ctx.reply("SMB credentials not available. Try restarting the container.");
    }
  } catch (error) {
    console.error("Error getting SMB credentials:", error);
    ctx.reply("Failed to get SMB credentials. Try again later.");
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
        case "/smb":
          handleSmb(ctx);
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
