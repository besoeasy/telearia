function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const path = require("path");

const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");

const { exec } = require("child_process");

function deleteOldFiles(ctx, days = 30) {
  ctx.reply(`Deleting files older than ${days} days`);

  exec(
    `find "${saveDirectory}" -type f -mtime +${days} -exec rm {} \\;`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        ctx.reply(`Error executing command: ${error.message}`);
        return;
      }
    }
  );
}

const os = require("os");

function getLocalIP() {
  const ifaces = os.networkInterfaces();

  let ip = "";

  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        ip = iface.address;
      }
    });
  });

  return ip;
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldFiles,
  getLocalIP,
};
