function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const path = require("path");

const tempdir = require("os").tmpdir();

const saveDirectory = path.join(tempdir, "downloads");

function deleteOldFiles(days = 30 ) {

  const command = `find "${saveDirectory}" -type f -mtime +${days} -exec rm {} \\;`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.log('Old files deleted successfully.');
  });
}

module.exports = {
  bytesToSize,
  saveDirectory,
  deleteOldFiles
};
