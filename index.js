#!/usr/bin/env node

const {
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
} = require("./func/aria2.js");

const { getIpData } = require("./func/ip.js");

const { bytesToSize } = require("./func/utils.js");

const { server } = require("./func/server.js");

const { spawn } = require("child_process");

const { Telegraf } = require("telegraf");

// Spawn aria2c process
const aria2c = spawn("aria2c", [
  "--continue=true",
  "--seed-ratio=2",
  "--seed-time=2000",
  "--enable-rpc",
  "--rpc-listen-all",
  "--rpc-allow-origin-all",
  "--rpc-listen-port=6800",
  "--enable-dht=true",
  "--dht-listen-port=6881-6999",
  "--dht-entry-point=router.bittorrent.com:6881",
  "--dht-entry-point=router.utorrent.com:6881",
  "--dht-entry-point=dht.transmissionbt.com:6881",
  "--dht-entry-point=dht.aelitis.com:6881",
  "--dht-entry-point6=router.bittorrent.com:6881",
  "--dht-entry-point6=router.utorrent.com:6881",
  "--dht-entry-point6=dht.transmissionbt.com:6881",
  "--dht-entry-point6=dht.aelitis.com:6881",
]);

if (!process.env.TELEGRAMBOT) {
  console.error("Error: TELEGRAMBOT environment variable is not set.");
  process.exit(1);
}

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAMBOT);

const handleAbout = (ctx) => {
  ctx.reply("https://github.com/besoeasy/telearia");
};

const handleStart = (ctx) => {
  const commands = [
    "/about - About this bot",
    "/start - Start this bot",
    "/stats - Get global stats",
    "/download <url> - Start a download",
    "/ongoing - Get ongoing downloads",
    "/status_<gid> - Get status of a download",
    "/cancel_<gid> - Cancel a download",
    "/server - Start/Stop http the server",
    "/ip - Get IP data",
  ];

  ctx.reply(
    `Your user id is: ${ctx.chat.id}\n\nAvailable commands:\n${commands.join(
      "\n"
    )}`
  );
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();

    let msg_ipfs = "";

    msg_ipfs = `
    Download speed: ${bytesToSize(stats.downloadSpeed)}
    Upload speed: ${bytesToSize(stats.uploadSpeed)}
    
    Active downloads: ${stats.numActive}
    Waiting downloads: ${stats.numWaiting}
    Stopped downloads: ${stats.numStopped}
    `;

    ctx.reply(`${msg_ipfs}`);
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve stats. Please try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const user_id = String(ctx.chat.id);

    const ddta = await downloadAria(user_id, url);

    const downloadId = ddta.result;

    ctx.reply(
      `Track all downloads with /ongoing \n\nDownload started with id: ${downloadId}\n\n/status_${downloadId}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to start download. Please try again later.");
  }
};

const handleOngoing = async (ctx) => {
  try {
    const { result: ongoingDownloads } = await getOngoingDownloads();
    const gids = ongoingDownloads.map((download) => download.gid);

    const formattedGids = gids.map((gid) => `/status_${gid}`).join("\n");

    if (ongoingDownloads.length > 0) {
      ctx.reply(`Ongoing Downloads GIDs:\n\n${formattedGids}`);
    } else {
      ctx.reply("No ongoing downloads.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve ongoing downloads. Please try again later.");
  }
};

const handleStatus = async (ctx, downloadId) => {
  try {
    const ddta = await getDownloadStatus(downloadId);
    const downloadSize_c = (
      ddta.result.completedLength / 1024 / 1024 || 0
    ).toFixed(2);
    const downloadSize_t = (ddta.result.totalLength / 1024 / 1024 || 0).toFixed(
      2
    );

    let reply = `Download status: ${ddta.result.status}\n\nDownload size: ${downloadSize_c} MB / ${downloadSize_t} MB`;

    if (ddta.result.status === "active") {
      reply = reply + `\n\nCancel download with /cancel_${downloadId}`;
    }

    if (ddta.result.status === "active") {
      const file = ddta.result.files[0].path;

      reply = reply + `\n\nDownloading file: ${file}`;
    }

    if (ddta.result.status === "complete") {
      const files = ddta.result.files.map((file) => file.path).join("\n");

      reply = reply + `\n\nDownloaded files:\n${files}`;
    }

    ctx.reply(reply);
  } catch (error) {
    console.error(error);
    ctx.reply(
      `Failed to retrieve status for download id: ${downloadId}. Please try again later.`
    );
  }
};

const handleCancel = async (ctx, downloadId) => {
  try {
    await cancelDownload(downloadId);
    ctx.reply(`Download canceled with id: ${downloadId}`);
  } catch (error) {
    console.error(error);
    ctx.reply(
      `Failed to cancel download with id: ${downloadId}. Please try again later.`
    );
  }
};

const handleIpData = async (ctx) => {
  try {
    const ipdata = await getIpData();

    let msg_ipdata = "";

    msg_ipdata = `
    IP: ${ipdata.query}
    Country: ${ipdata.country}
    Region: ${ipdata.regionName}
    City: ${ipdata.city}
    ISP: ${ipdata.isp}
    `;

    ctx.reply(`${msg_ipdata}`);
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve IP data. Please try again later.");
  }
};

let servertoggle = true;

const handleServer = async (ctx) => {
  try {
    if (servertoggle) {
      server.listen(6600, () => {});
      ctx.reply("Server started at http://localhost:6600");
    } else {
      server.close();
      ctx.reply("Server stopped");
    }

    servertoggle = !servertoggle;
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to start server. Please try again later.");
  }
};

bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map((arg) => arg.trim());

      console.log(
        `@${ctx.from.username} (id: ${ctx.from.id}) at ${ctx.message.date}: ${text}`
      );

      switch (lowerCaseCommand) {
        case "/about":
          handleAbout(ctx);
          break;

        case "/start":
          handleStart(ctx);
          break;

        case "/stats":
          handleStats(ctx);
          break;

        case "/download":
        case "/dl":
          if (trimmedArgs.length > 0) {
            handleDownload(ctx, trimmedArgs[0]);
          } else {
            ctx.reply("Please provide a URL to download.");
          }
          break;

        case "/ongoing":
          handleOngoing(ctx);
          break;

        case "/ip":
          handleIpData(ctx);
          break;

        case "/server":
          handleServer(ctx, server);
          break;

        default:
          if (lowerCaseCommand.startsWith("/status_")) {
            handleStatus(ctx, lowerCaseCommand.split("_")[1]);
          } else if (lowerCaseCommand.startsWith("/cancel_")) {
            handleCancel(ctx, lowerCaseCommand.split("_")[1]);
          } else {
            ctx.reply(
              `Unknown command: ${lowerCaseCommand}` +
                "\n\n" +
                "Type /start to see available commands"
            );
          }
      }
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred. Please try again later.");
    }
  }
});

bot.catch((err, ctx) => {
  console.error(`Encountered an error for ${ctx.updateType}`, err);
});

bot.launch();

process.once("SIGINT", () => {
  console.log("SIGINT received. Exiting...");
  bot.stop("SIGINT");
  aria2c.kill();
  process.exit();
});
