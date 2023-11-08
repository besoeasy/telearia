require('dotenv').config();

const { getIpAddress, getPublicIp, getSys, getUptime } = require('./modules/os.js');

const { bytesToSize } = require('./modules/utils.js');

const { openTunnels, openServeoTunnel } = require('./modules/tunnel.js');

const { getGlobalStats, downloadAria, getDownloadStatus, cancelDownload, httpServer } = require('./modules/aria2.js');

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAMBOT);

const port = process.env.PORT || Math.floor(Math.random() * (2890 - 2280 + 1)) + 2280;

bot.on('message', async (ctx) => {
	try {
		const { message_id, from, chat, date, text } = ctx.message;

		const [command, ...args] = text.split(' ');

		const lowerCaseCommand = command.toLowerCase().trim();

		const trimmedArgs = args.map((arg) => arg.trim());

		if (lowerCaseCommand === '/start') {
			ctx.reply(`Your user id is: ${chat.id}`);
		}

		if (lowerCaseCommand === '/stats') {
			const { result: stats } = await getGlobalStats();

			const { totalMemory, freeMemory, usedMemoryPercentage } = await getSys();

			const { uptimeHours, uptimeMinutes } = await getUptime();

			const msgToSend =
				`Server Uptime: ${uptimeHours} hours and ${uptimeMinutes} minutes\n` +
				`\n\n` +
				`Server Memory: ${bytesToSize(totalMemory)}\n` +
				`Free Memory: ${bytesToSize(freeMemory)}\n` +
				`Server Memory Used: ${usedMemoryPercentage}%\n` +
				`\n\n` +
				`Download speed: ${bytesToSize(stats.downloadSpeed)}\n` +
				`Upload speed: ${bytesToSize(stats.uploadSpeed)}\n` +
				`\n\n` +
				`Active downloads: ${stats.numActive}\n` +
				`Waiting downloads: ${stats.numWaiting}\n` +
				`Stopped downloads: ${stats.numStopped}`;

			ctx.reply(msgToSend);
		}

		if (lowerCaseCommand === '/ip') {
			const ipLocal = await getIpAddress();
			const ipPublic = await getPublicIp();

			ctx.reply(
				`Local IP : ${ipLocal} \nPublic IP : ${ipPublic.ip}\nISP : ${ipPublic.isp}\nCity : ${ipPublic.city}\nCountry : ${ipPublic.country}`
			);
		}

		if (lowerCaseCommand === '/tunnels') {
			ctx.reply(`openTunnels :  ${openTunnels}`);
		}

		if (lowerCaseCommand === '/open') {
			const port = parseInt(args[0]);
			if (!isNaN(port)) {
				ctx.reply(`Trying to connect to port ${port}...`);
				openServeoTunnel(port, 80);
			} else {
				ctx.reply('Invalid port number. Please provide a valid port as an argument.');
			}
		}

		if (lowerCaseCommand === '/download' || lowerCaseCommand === '/dl') {
			if (trimmedArgs.length > 0) {
				const [url] = trimmedArgs;

				const { result: ddta } = await downloadAria(chat.id, url);
				const downloadId = ddta.result;

				ctx.reply(`Download started with id: ${downloadId} \n\n/status_${downloadId}\n\n/cancel_${downloadId}`);
			}
		}

		if (lowerCaseCommand.startsWith('/status_')) {
			const downloadId = lowerCaseCommand.split('_')[1];

			const { result: ddta } = await getDownloadStatus(downloadId);

			const downloadSize_c = (ddta.result.completedLength / 1024 / 1024 || 0).toFixed(2);

			const downloadSize_t = (ddta.result.totalLength / 1024 / 1024 || 0).toFixed(2);

			ctx.reply(`Download status: ${ddta.result.status} \n\nDownload size: ${downloadSize_c} MB / ${downloadSize_t} MB`);
		}

		if (lowerCaseCommand.startsWith('/cancel_')) {
			const downloadId = lowerCaseCommand.split('_')[1];

			const { result: ddta } = await cancelDownload(downloadId);

			ctx.reply(`Download canceled with id: ${downloadId}`);
		}

		if (lowerCaseCommand === '/content') {
			const ipAddress = await getIpAddress();

			ctx.reply(`HTTP : http://${ipAddress}:${port}`);
		}
	} catch (error) {
		console.error(error);
		ctx.reply('An error occurred. Please try again later.');
	}
});

bot.launch();
httpServer.listen(port);
