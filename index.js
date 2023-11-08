const { getIpAddress, getSys, getUptime } = require('./modules/os.js');

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAMBOT);

bot.on('message', async (ctx) => {
	try {
		const { message_id, from, chat, date, text } = ctx.message;

		const [command, ...args] = text.split(' ');

		const lowerCaseCommand = command.toLowerCase().trim();

		const trimmedArgs = args.map((arg) => arg.trim());

		console.log(`@${from.username || 'X'} - ${chat.id} - ${text}`);

		if (lowerCaseCommand === '/start') {
			ctx.reply(`Your user id is: ${chat.id}, Ver : ${version}`);
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
			const ipAddress = await getIpAddress();

			ctx.reply(`IP : ${ipAddress}`);
		}
	} catch (error) {
		console.log(error);
	}
});

bot.launch();
