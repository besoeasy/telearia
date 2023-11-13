

const { exec } = require('child_process');

let openTunnels = [];

function parseUrlsFromString(inputString) {
	const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g;
	const urls = inputString.match(urlRegex);
	return urls || [];
}



//experimental
function openServeoTunnel(localPort, remotePort) {
	return new Promise((resolve, reject) => {
		const child = exec(`ssh -o StrictHostKeyChecking=no  -R ${remotePort}:localhost:${localPort} serveo.net`);

		child.stdout.on('data', (data) => {
			console.log(data);
			const das = parseUrlsFromString(data);
			openTunnels.push(das);

			const uniqueArray = openTunnels.filter((element, index, array) => {
				return array.indexOf(element) === index;
			});

			openTunnels = uniqueArray;
			resolve();
		});

		child.stderr.on('data', (data) => {
			console.error(data);
			reject(data);
		});

		child.on('exit', (code) => {
			console.log(`Child process exited with code ${code}`);
		});

		child.on('error', (err) => {
			console.error(`Child process error: ${err}`);
			reject(err);
		});
	});
}

module.exports = { openTunnels, openServeoTunnel };
