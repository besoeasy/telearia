#!/usr/bin/env node

require("dotenv").config();

const { spawn } = require("child_process");

const { Telegraf } = require("telegraf");

const {
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
  server,
} = require("./x/aria2.js");

const { ipfsAgent } = require("./x/ipfs.js");

const { bytesToSize, ariaconfig } = require("./x/utils.js");

if (!process.env.TELEGRAMBOT) {
  console.error("Error: TELEGRAMBOT environment variable is not set.");
  process.exit(1);
}

// Spawn aria2c process
const aria2c = spawn("aria2c", ariaconfig);

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAMBOT);

const handleAbout = (ctx) => {
  ctx.reply("https://github.com/besoeasy/telearia");
};

const handleStart = (ctx) => {
  ctx.reply(`Your user id is: ${ctx.chat.id}`);

  const commands = [
    "/about - About this bot",
    "/start - Start this bot",
    "/stats - Get global stats",
    "/download <url> - Start a download",
    "/ongoing - Get ongoing downloads",
    "/status_<gid> - Get status of a download",
    "/cancel_<gid> - Cancel a download",
    "/server - Start/Stop http the server",
    "/ipfs - Start/Stop ipfs daemon",
  ];

  ctx.reply(`Available commands:\n${commands.join("\n")}`);
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();
    const networkMessage = `Download speed: ${bytesToSize(
      stats.downloadSpeed
    )}\nUpload speed: ${bytesToSize(stats.uploadSpeed)}`;
    const downloadStatsMessage = `Active downloads: ${stats.numActive}\nWaiting downloads: ${stats.numWaiting}\nStopped downloads: ${stats.numStopped}`;

    let msg_ipfs = "";

    if (!ipfstoggle) {
      const ipfsAgentData = await ipfsAgent();

      msg_ipfs = `IPFS Agent Version: ${ipfsAgentData.AgentVersion}\nIPFS ID: ${ipfsAgentData.ID}\nIPFS Public Key: ${ipfsAgentData.PublicKey}`;
    }

    ctx.reply(`${networkMessage}\n\n${downloadStatsMessage}\n\n${msg_ipfs}`);
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to retrieve stats. Please try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const ddta = await downloadAria(ctx.chat.id, url);
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
    const formattedGids = gids.map((gid) => `/status_${gid}`).join(", ");

    if (ongoingDownloads.length > 0) {
      ctx.reply(`Ongoing Downloads GIDs:\n${formattedGids}`);
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

let servertoggle = true;

const handleServer = async (ctx) => {
  try {
    if (servertoggle) {
      server.listen(6600, () => {});
      ctx.reply("Server started");
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

let ipfstoggle = true;
let ipfsNode;

const handleIpfs = async (ctx) => {
  try {
    if (ipfstoggle) {
      ipfsnode = spawn("ipfs", ["daemon"]);
      ctx.reply("Ipfs started");
    } else {
      ipfsNode.kill();
      ctx.reply("IPFS daemon stopped");
    }

    ipfstoggle = !ipfstoggle;
  } catch (error) {
    console.error(error);
    ctx.reply("Failed to start server. Please try again later.");
  }
};

const handleIPFSshare = async (ctx) => {
  try {
    if (!ipfstoggle) {
      ctx.reply("Please start the IPFS daemon first. using /ipfs");
      return;
    }

    ipfsNode = spawn("ipfs", ["add", "-Q", "-r", "./downloads"]);

    ipfsNode.stdout.on("data", (data) => {
      ctx.reply(`IPFS hash: ${data.toString()}`);

      ctx.reply(`https://ipfs.io/ipfs/${data.toString()}`);
    });
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

        case "/server":
          handleServer(ctx, server);
          break;

        case "/ipfs":
          handleIpfs(ctx);
          break;

        case "/share":
          handleIPFSshare(ctx);
          break;

        default:
          if (lowerCaseCommand.startsWith("/status_")) {
            handleStatus(ctx, lowerCaseCommand.split("_")[1]);
          } else if (lowerCaseCommand.startsWith("/cancel_")) {
            handleCancel(ctx, lowerCaseCommand.split("_")[1]);
          } else {
            ctx.reply(`Unknown command: ${lowerCaseCommand}`);
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

bot.launch({
  polling: {
    interval: 3000,
  },
});

process.once("SIGINT", () => {
  console.log("SIGINT received. Exiting...");
  bot.stop("SIGINT");
  aria2c.kill("SIGINT");
  process.exit();
});
