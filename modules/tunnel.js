const { exec } = require("child_process");

const { insertUrl, getUrls } = require("./db");

function parseUrlsFromString(inputString) {
  const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g;
  const urls = inputString.match(urlRegex);
  return urls || [];
}

function openServeoTunnel(localPort, remotePort) {
  const child = exec(
    `ssh -o StrictHostKeyChecking=no  -R ${remotePort}:localhost:${localPort} serveo.net`
  );

  child.stdout.on("data", (data) => {
    console.log(data);

    openTunnels = parseUrlsFromString(data);

    openTunnels.forEach((url) => {
      insertUrl(url, localPort);
    });
  });

  child.stderr.on("data", (data) => {
    console.error(data);
  });

  child.on("exit", (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  child.on("error", (err) => {
    console.error(`Child process error: ${err}`);
  });
}

module.exports = { openServeoTunnel };
