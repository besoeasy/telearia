require('dotenv').config();

const { getIpAddress, getPublicIp, getSys, getUptime } = require('./modules/os.js');
const { bytesToSize } = require('./modules/utils.js');
const { openTunnels, openServeoTunnel } = require('./modules/tunnel.js');
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
	} catch (error) {
		console.error(error);
		ctx.reply('An error occurred. Please try again later.');
	}
});

bot.launch();
