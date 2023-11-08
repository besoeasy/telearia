const axios = require('axios');

const os = require('os');

const ifaces = os.networkInterfaces();

async function getSys() {
	const totalMemory = os.totalmem();

	const freeMemory = os.freemem();

	const usedMemoryPercentage = Math.round((1 - freeMemory / totalMemory) * 100);

	return {
		totalMemory: totalMemory,
		freeMemory: freeMemory,
		usedMemoryPercentage: usedMemoryPercentage,
	};
}

async function getUptime() {
	const uptime = os.uptime();
	const uptimeHours = Math.floor(uptime / 3600);
	const uptimeMinutes = Math.floor((uptime % 3600) / 60);

	return {
		uptime: uptime,
		uptimeHours: uptimeHours,
		uptimeMinutes: uptimeMinutes,
	};
}

async function getIpAddress() {
	let ipAddress = 'localhost';

	Object.keys(ifaces).forEach((ifname) => {
		let alias = 0;

		ifaces[ifname].forEach((iface) => {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				return;
			}

			if (alias >= 1) {
				console.log(`${ifname}:${alias}`, iface.address);
			} else {
				console.log(ifname, iface.address);
			}

			alias += 1;
			ipAddress = iface.address;
		});
	});

	return ipAddress;
}

async function getPublicIp() {
	const apiUrl = 'http://ip-api.com/json';

	try {
		const response = await axios.get(apiUrl);

		return {
			ip: response.data.query || null,
			isp: response.data.isp || null,
			city: response.data.city || null,
			country: response.data.country || null,
		};
	} catch (error) {
		console.error(error);
		throw new Error('Failed to get public IP address');
	}
}
module.exports = { getIpAddress, getPublicIp, getSys, getUptime };
