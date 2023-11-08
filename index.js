require('dotenv').config();

const { getIpAddress, getPublicIp, getSys, getUptime } = require('./modules/os.js');

const { bytesToSize } = require('./modules/utils.js');

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAMBOT);

bot.on('message', async (ctx) => {
	try {
		const { message_id, from, chat, date, text } = ctx.message;

		const [command, ...args] = text.split(' ');

		const lowerCaseCommand = command.toLowerCase().trim();

		if (lowerCaseCommand === '/start') {
			ctx.reply(`Your user id is: ${chat.id}`);
		}

		if (lowerCaseCommand === '/stats') {
			const { totalMemory, freeMemory, usedMemoryPercentage } = await getSys();

			const { uptimeHours, uptimeMinutes } = await getUptime();

			const msgToSend =
				`Server Uptime: ${uptimeHours} hours and ${uptimeMinutes} minutes\n` +
				`\n\n` +
				`Server Memory: ${bytesToSize(totalMemory)}\n` +
				`Free Memory: ${bytesToSize(freeMemory)}\n` +
				`Server Memory Used: ${usedMemoryPercentage}%\n`;

			ctx.reply(msgToSend);
		}

		if (lowerCaseCommand === '/ip') {
			const ipLocal = await getIpAddress();
			const ipPublic = await getPublicIp();

			ctx.reply(`Local IP : ${ipLocal} and Public IP : ${ipPublic}`);
		}
	} catch (error) {
		console.log(error);
	}
});

bot.launch();
