#!/usr/bin/env node

require("dotenv").config();

const { version } = require("./package.json");
const { getGlobalStats, downloadAria, getDownloadStatus, getOngoingDownloads, cancelDownload } = require("./func/aria2.js");
const { getIpData } = require("./func/ip.js");
const { bytesToSize, deleteOldFiles } = require("./func/utils.js");
const { Telegraf } = require("telegraf");
const sha256 = require("crypto-js/sha256");

if (!process.env.TELEGRAMBOT) {
  console.error("Error: TELEGRAMBOT Environment Variable is not set.");
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAMBOT);

function cleanUser(str) {
  return str.toString();
}

// Define commands with more user-friendly descriptions
const commands = [
  "/about - Info about this bot",
  "/start - Get started with the bot",
  "/stats - View global download/upload stats",
  "/download <url> - Start a new download",
  "/downloading - Check ongoing downloads",
  "/status_<gid> - Get specific download status",
  "/cancel_<gid> - Cancel a specific download",
  "/ip - Display server IP info",
];

const handleAbout = (ctx) => {
  ctx.reply("🔗 GitHub Repo: [TeleAria](https://github.com/besoeasy/telearia)");
};

const handleStart = (ctx) => {
  const userIdHash = cleanUser(ctx.chat.id);
  const downloadUrl = process.env.TUNNELURL || "http://pi.local:6799";
  ctx.replyWithMarkdown(`
  **Welcome to TeleAria!** 🎉

  🔹 **Version:** ${version}
  🔹 **User ID:** ${userIdHash}
  🔹 **Your Downloads:** [Manage here](${downloadUrl}/${userIdHash}/)

  **Available Commands:**
  ${commands.map(cmd => `🔸 ${cmd}`).join("\n")}
  `);
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();
    ctx.replyWithMarkdown(`
    **📊 Global Stats:**

    🔹 **Download Speed:** ${bytesToSize(stats.downloadSpeed)}
    🔹 **Upload Speed:** ${bytesToSize(stats.uploadSpeed)}
    🔹 **Active Downloads:** ${stats.numActive}
    🔹 **Waiting Downloads:** ${stats.numWaiting}
    🔹 **Stopped Downloads:** ${stats.numStopped}
    `);
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to retrieve stats. Please try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const userIdHash = cleanUser(ctx.chat.id);
    const downloadData = await downloadAria(userIdHash, url);
    const downloadId = downloadData.result;

    ctx.replyWithMarkdown(
      `📥 **Download Started!**\n\n🔹 **Download ID:** ${downloadId}\n🔹 **Track progress with** /status_${downloadId} or view all downloads with /downloading`,
      { disable_web_page_preview: true }
    );
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to start download. Please try again later.");
  }
};

const handleStatus = async (ctx, downloadId) => {
  try {
    const downloadData = await getDownloadStatus(downloadId);
    const completedSize = (downloadData.result.completedLength / 1024 / 1024).toFixed(2);
    const totalSize = (downloadData.result.totalLength / 1024 / 1024).toFixed(2);

    let reply = `**🔍 Download Status:**\n\n**Status:** ${downloadData.result.status}\n**Progress:** ${completedSize} MB / ${totalSize} MB`;

    if (downloadData.result.status === "active") {
      reply += `\n🔸 **Cancel with** /cancel_${downloadId}`;
    } else if (downloadData.result.status === "complete") {
      const files = downloadData.result.files.map(file => file.path).join("\n");
      reply += `\n🔹 **Downloaded Files:**\n${files}`;
    }

    ctx.replyWithMarkdown(reply);
  } catch (error) {
    console.error(error);
    ctx.reply(`⚠️ Failed to retrieve status for download ID: ${downloadId}. Please try again later.`);
  }
};

const handleCancel = async (ctx, downloadId) => {
  try {
    await cancelDownload(downloadId);
    ctx.reply(`✅ **Download with ID ${downloadId} canceled successfully.**`);
  } catch (error) {
    console.error(error);
    ctx.reply(`⚠️ Failed to cancel download with ID: ${downloadId}. Please try again later.`);
  }
};

const handleIpData = async (ctx) => {
  try {
    const ipData = await getIpData();
    ctx.replyWithMarkdown(`
    **🌍 Server IP Information:**

    🔹 **IP:** ${ipData.query}
    🔹 **Country:** ${ipData.country}
    🔹 **Region:** ${ipData.regionName}
    🔹 **City:** ${ipData.city}
    🔹 **ISP:** ${ipData.isp}
    `);
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to retrieve IP data. Please try again later.");
  }
};

const downloading = async (ctx) => {
  try {
    const { result: ongoingDownloads } = await getOngoingDownloads();

    if (ongoingDownloads.length > 0) {
      let reply = "📥 **Ongoing Downloads** 📥\n\n";

      for (const download of ongoingDownloads) {
        const { gid, completedLength, totalLength, status } = download;

        const downloadedSize = (completedLength / 1024 / 1024).toFixed(2);
        const totalSize = (totalLength / 1024 / 1024).toFixed(2);
        const progress = ((completedLength / totalLength) * 100).toFixed(2);

        reply += `🆔 **ID**: /status_${gid}\n`;
        reply += `📊 **Status**: ${status}\n`;
        reply += `📈 **Progress**: ${downloadedSize} MB / ${totalSize} MB (${progress}%)\n`;
        reply += `────────────────────────────\n\n`;
      }

      ctx.replyWithMarkdown(reply);
    } else {
      ctx.reply("✅ **No ongoing downloads.**");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to retrieve ongoing downloads. Please try again later.");
  }
};

// Message handler
bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map(arg => arg.trim());

      console.log(`@${ctx.from.username} (ID: ${ctx.from.id}): ${text}`);

      switch (lowerCaseCommand) {
        case "/clean":
          deleteOldFiles(process.env.PURGEINTERVAL || 7);
          ctx.reply("🧹 **Old files cleaned!**");
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
          else ctx.reply("⚠️ **Please provide a URL to download.**");
          break;
        default:
          if (lowerCaseCommand.startsWith("/status_")) handleStatus(ctx, lowerCaseCommand.split("_")[1]);
          else if (lowerCaseCommand.startsWith("/cancel_")) handleCancel(ctx, lowerCaseCommand.split("_")[1]);
          else ctx.reply(`❔ Unknown command: ${lowerCaseCommand}\n\nType /start to see available commands.`);
      }
    } catch (error) {
      console.error(error);
      ctx.reply("⚠️ An error occurred. Please try again later.");
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
