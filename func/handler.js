const { version } = require("../package.json");

const {
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
} = require("./aria2.js");

const { getIpData } = require("./ip.js");

const {
  bytesToSize,
  deleteOldFiles,
  cleanUser,
  teleariaPort,
  teleariaURL,
} = require("./utils.js");

const commands = [
  "/about - Learn more about TeleAria",
  "/start - Begin your download journey",
  "/stats - Check global download stats",
  "/download <url> - Start downloading a file",
  "/downloading - View active downloads",
  "/status_<gid> - Check a specific download",
  "/cancel_<gid> - Stop a specific download",
  "/ip - Show server IP details",
  "/clean - Remove oldest downloaded file",
];

const handleAbout = (ctx) => {
  ctx.reply(
    "✨ *TeleAria* ✨\n" +
    "A Telegram-controlled cloud downloader!\n\n" +
    "📍 GitHub: [TeleAria](https://github.com/besoeasy/telearia)"
  );
};

const handleStart = (ctx) => {
  const userIdHash = cleanUser(ctx.chat.id);
  ctx.reply(
    "🎉 *Welcome to TeleAria!* 🎉\n" +
    "Your cloud downloading companion\n\n" +
    `🔹 *Version*: ${version}\n` +
    `🔹 *Port*: ${teleariaPort}\n` +
    `🔹 *User ID*: ${userIdHash}\n\n` +
    `📥 *Downloads*: ${teleariaURL}/${userIdHash}/\n` +
    `📺 *Stremio Addon*: ${teleariaURL}/manifest.json\n\n` +
    "*Available Commands:*\n" +
    commands.map((cmd) => `➜ ${cmd}`).join("\n")
  );
};

const handleStats = async (ctx) => {
  try {
    const { result: stats } = await getGlobalStats();
    ctx.reply(
      "📊 *Global Statistics* 📊\n\n" +
      `⬇️ *Download Speed*: ${bytesToSize(stats.downloadSpeed)}/s\n` +
      `⬆️ *Upload Speed*: ${bytesToSize(stats.uploadSpeed)}/s\n` +
      `▶️ *Active*: ${stats.numActive}\n` +
      `⏳ *Waiting*: ${stats.numWaiting}\n` +
      `⏹️ *Stopped*: ${stats.numStopped}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Oops! Couldn't fetch stats. Try again later.");
  }
};

const handleDownload = async (ctx, url) => {
  try {
    const userIdHash = cleanUser(ctx.chat.id);
    const downloadData = await downloadAria(userIdHash, url);
    const downloadId = downloadData.result;

    ctx.reply(
      "🚀 *Download Started!* 🚀\n" +
      `Track it with: /status_${downloadId}\n` +
      `Or see all: /downloading`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to start download. Please try again.");
  }
};

const handleStatus = async (ctx, downloadId) => {
  try {
    const downloadData = await getDownloadStatus(downloadId);
    const completedSize = (downloadData.result.completedLength / 1024 / 1024).toFixed(2);
    const totalSize = (downloadData.result.totalLength / 1024 / 1024).toFixed(2);
    const percent = ((completedSize / totalSize) * 100).toFixed(1);

    let reply =
      `📈 *Download Status* 📈\n\n` +
      `🔹 *Status*: ${downloadData.result.status}\n` +
      `🔹 *Progress*: ${completedSize} MB / ${totalSize} MB (${percent}%)\n`;

    if (downloadData.result.status === "active") {
      reply += `🔹 *Cancel*: /cancel_${downloadId}\n`;
    }

    const files = downloadData.result.files.map((file) => `📄 ${file.path}`).join("\n");
    reply += `\n*Files:*\n${files}`;

    ctx.reply(reply);
  } catch (error) {
    console.error(error);
    ctx.reply(`⚠️ Couldn't get status for ${downloadId}. Try again later.`);
  }
};

const handleCancel = async (ctx, downloadId) => {
  try {
    await cancelDownload(downloadId);
    ctx.reply(`✅ *Download ${downloadId} canceled successfully!*`);
  } catch (error) {
    console.error(error);
    ctx.reply(`⚠️ Failed to cancel ${downloadId}. Try again later.`);
  }
};

const handleIpData = async (ctx) => {
  try {
    const ipData = await getIpData();
    ctx.reply(
      "🌐 *Server IP Info* 🌐\n\n" +
      `🔹 *IP*: ${ipData.query}\n` +
      `🔹 *Country*: ${ipData.country}\n` +
      `🔹 *Region*: ${ipData.regionName}\n` +
      `🔹 *City*: ${ipData.city}\n` +
      `🔹 *ISP*: ${ipData.isp}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Couldn't fetch IP info. Try again later.");
  }
};

const handleClean = (ctx) => {
  try {
    deleteOldFiles(ctx);
    ctx.reply("🧹 *Cleaning up old files... Done!*");
  } catch (error) {
    console.error("Error during file cleanup:", error);
    ctx.reply("⚠️ Cleanup failed. Try again later.");
  }
};

const downloading = async (ctx) => {
  try {
    const { result: ongoingDownloads } = await getOngoingDownloads();

    if (ongoingDownloads.length > 0) {
      let reply = "⏬ *Ongoing Downloads* ⏬\n\n";

      for (const download of ongoingDownloads) {
        const { gid, completedLength, totalLength, status } = download;
        const downloadedSize = (completedLength / 1024 / 1024).toFixed(2);
        const totalSize = (totalLength / 1024 / 1024).toFixed(2);
        const progress = ((completedLength / totalLength) * 100).toFixed(1);

        reply += `🔗 *ID*: /status_${gid}\n`;
        reply += `🔹 *Status*: ${status}\n`;
        reply += `🔹 *Progress*: ${downloadedSize} MB / ${totalSize} MB (${progress}%)\n`;
        reply += `------------------------\n`;
      }

      ctx.reply(reply);
    } else {
      ctx.reply("🌴 *No ongoing downloads right now.*");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Failed to fetch downloads. Try again later.");
  }
};

module.exports = {
  handleAbout,
  handleStart,
  handleStats,
  handleDownload,
  handleStatus,
  handleCancel,
  handleIpData,
  handleClean,
  downloading,
};
