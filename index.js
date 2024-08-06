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

const { bytesToSize, deleteOldFiles, getLocalIP } = require("./func/utils.js");

const { server } = require("./func/server.js");

const { Telegraf } = require("telegraf");

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
  "/purge - Delete old files",
];

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
  ctx.reply(
    `Your user id is: ${ctx.chat.id}
    
     TeleAria Version : ${version}

     Available commands:\n${commands.join("\n")}`
  );
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();

    ctx.reply(`Download speed: ${bytesToSize(
      stats.downloadSpeed
    )}\nUpload speed: ${bytesToSize(stats.uploadSpeed)}\nActive downloads: ${
      stats.numActive
    }\nWaiting downloads: ${stats.numWaiting}\nStopped downloads: ${
      stats.numStopped
    }
    `);
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

    const localipdata = getLocalIP();

    let msg_ipdata = "";

    msg_ipdata = `


    Local IP: ${localipdata}

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
      server.listen(6799, () => {});
      const localipdata = getLocalIP();

      ctx.reply(
        `Server started at port 6799 \n\nhttp://${localipdata}:6799 \n\nUse /server to stop the server`
      );
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

// Handle messages
bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map((arg) => arg.trim());

      const log = `@${ctx.from.username} (id: ${ctx.from.id}) at ${ctx.message.date}: ${text}`;

      console.log(log);

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

        case "/purge":
          deleteOldFiles(ctx, 30);
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
  process.exit();
});
