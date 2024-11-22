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
      `Version: ${version} on Port : ${teleariaPort}\n` +
      `User ID: ${userIdHash}\n` +
      `Downloads URL: ${teleariaURL}/${userIdHash}/\n\n` +
      `Stremio Addon: ${teleariaURL}/manifest.json\n\n` +
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
      reply += `\nCancel with /cancel_${downloadId}\n\n`;
    }

    const files = downloadData.result.files.map((file) => file.path).join("\n");
    reply += `\nDownloaded Files:\n${files}`;

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

const handleClean = (ctx) => {
  try {
    deleteOldFiles(ctx);
  } catch (error) {
    console.error("Error during file cleanup:", error);
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
