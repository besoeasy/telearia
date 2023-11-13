#!/usr/bin/env node

require("dotenv").config();

const {
  getIpAddress,
  getPublicIp,
  getSys,
  getUptime,
} = require("./modules/os.js");

const { bytesToSize } = require("./modules/utils.js");

const { openTunnels, openServeoTunnel } = require("./modules/tunnel.js");

const { getUrls } = require("./modules/db.js");

const {
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
  httpServer,
} = require("./modules/aria2.js");

const { compareVersions } = require("./modules/update.js");

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAMBOT);

const port = process.env.PORT || 6700;

let httpServerRunning = false;

bot.on("message", async (ctx) => {
  try {
    const { message_id, from, chat, date, text } = ctx.message;

    const [command, ...args] = text.split(" ");

    const lowerCaseCommand = command.toLowerCase().trim();

    const trimmedArgs = args.map((arg) => arg.trim());

    if (lowerCaseCommand === "/about") {
      ctx.reply(`https://github.com/besoeasy/telepi`);
    }

    if (lowerCaseCommand === "/start") {
      ctx.reply(`Your user id is: ${chat.id}`);

      const { textSend } = await compareVersions();

      ctx.reply(`Checking TelePI Versions :\n\n${textSend}`);
    }

    if (lowerCaseCommand === "/stats") {
      const { result: stats } = await getGlobalStats();

      const { totalMemory, freeMemory, usedMemoryPercentage } = await getSys();

      const { uptimeHours, uptimeMinutes } = await getUptime();

      const uptimeMessage = `Server Uptime: ${uptimeHours} hours and ${uptimeMinutes} minutes`;

      const memoryMessage =
        `Server Memory: ${bytesToSize(totalMemory)}\n` +
        `Free Memory: ${bytesToSize(freeMemory)}\n` +
        `Server Memory Used: ${usedMemoryPercentage}%`;

      const networkMessage =
        `Download speed: ${bytesToSize(stats.downloadSpeed)}\n` +
        `Upload speed: ${bytesToSize(stats.uploadSpeed)}`;

      const downloadStatsMessage =
        `Active downloads: ${stats.numActive}\n` +
        `Waiting downloads: ${stats.numWaiting}\n` +
        `Stopped downloads: ${stats.numStopped}`;

      const msgToSend = `${uptimeMessage}\n\n${memoryMessage}\n\n${networkMessage}\n\n${downloadStatsMessage}`;

      ctx.reply(msgToSend);
    }

    if (lowerCaseCommand === "/ip") {
      const ipLocal = await getIpAddress();
      const ipPublic = await getPublicIp();

      ctx.reply(
        `Local IP : ${ipLocal} \nPublic IP : ${ipPublic.ip}\nISP : ${ipPublic.isp}\nCity : ${ipPublic.city}\nCountry : ${ipPublic.country}`
      );
    }

    if (lowerCaseCommand === "/tunnels") {
      const dddta = (await getUrls()) || null;

      dddta.map((url) => {
        const { id, url: urlx, port } = url;
        ctx.reply(`URL: ${urlx} | PORT: ${port}`);
      });
    }

    if (lowerCaseCommand === "/open") {
      const port = parseInt(args[0]);
      if (!isNaN(port)) {
        ctx.reply(`Trying to connect to port ${port}...`);
        openServeoTunnel(port, 80);

        ctx.reply(`See opened tunnels using /tunnels`);
      } else {
        ctx.reply(
          "Invalid port number. Please provide a valid port as an argument."
        );
      }
    }

    if (lowerCaseCommand === "/download" || lowerCaseCommand === "/dl") {
      if (trimmedArgs.length > 0) {
        const [url] = trimmedArgs;

        const ddta = await downloadAria(chat.id, url);

        const downloadId = ddta.result;

        ctx.reply(
          `Download started with id: ${downloadId} \n\n/status_${downloadId}\n\n/cancel_${downloadId}`
        );
      }
    }

    if (lowerCaseCommand === "/ongoing") {
      const { result: ongoingDownloads } = await getOngoingDownloads();

      const gids = ongoingDownloads.map((download) => download.gid);

      const formattedGids = gids.map((gid) => `/status_${gid}`).join(", ");

      ctx.reply(`Ongoing Downloads GIDs: ${formattedGids}`);
    }

    if (lowerCaseCommand.startsWith("/status_")) {
      const downloadId = lowerCaseCommand.split("_")[1];

      const ddta = await getDownloadStatus(downloadId);

      const downloadSize_c = (
        ddta.result.completedLength / 1024 / 1024 || 0
      ).toFixed(2);

      const downloadSize_t = (
        ddta.result.totalLength / 1024 / 1024 || 0
      ).toFixed(2);

      ctx.reply(
        `Download status: ${ddta.result.status} \n\nDownload size: ${downloadSize_c} MB / ${downloadSize_t} MB`
      );
    }

    if (lowerCaseCommand.startsWith("/cancel_")) {
      const downloadId = lowerCaseCommand.split("_")[1];

      const ddta = await cancelDownload(downloadId);

      ctx.reply(`Download canceled with id: ${downloadId}`);
    }

    if (lowerCaseCommand === "/downloads") {
      const portx = parseInt(args[0]) || port;

      const ipAddress = await getIpAddress();

      if (!httpServerRunning) {
        ctx.reply(`Summoning a http server for the downloads folder ......`);

        httpServer.listen(portx, () => {
          console.log(`HTTP server started on port ${portx}`);
          httpServerRunning = true;
        });
      }

      ctx.reply(`HTTP : http://${ipAddress}:${portx}`);
    }

    if (!lowerCaseCommand.startsWith("/")) {
      ctx.reply(`I don't understand this command: ${lowerCaseCommand}`);
    }
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

bot.launch();

const { spawn } = require("child_process");

const aria2c = spawn("aria2c", [
  "--seed-time=60",
  "--enable-rpc",
  "--rpc-listen-all",
  "--rpc-allow-origin-all",
  "--rpc-listen-port=6800",
  "--enable-dht=true",
  "--dht-listen-port=6881-7999",
  "--dht-entry-point=router.bittorrent.com:6881",
  "--dht-entry-point6=router.bittorrent.com:6881",
  "--dht-entry-point6=router.utorrent.com:6881",
  "--dht-entry-point6=dht.transmissionbt.com:6881",
  "--dht-entry-point6=dht.aelitis.com:6881",
]);
