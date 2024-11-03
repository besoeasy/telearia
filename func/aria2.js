const axios = require("axios");
const path = require("path");
const { saveDirectory } = require("./utils.js");

const axiosPost = async (method, params = []) => {
  const { data } = await axios.post("http://localhost:6800/jsonrpc", {
    jsonrpc: "2.0",
    method,
    id: 1,
    params,
  });
  return data;
};

const getVersion = async () => {
  return await axiosPost("aria2.getVersion");
};

const getGlobalStats = async () => {
  return await axiosPost("aria2.getGlobalStat");
};

const downloadAria = async (id, url) => {
  // Get current date in YYYYMMDD format
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  // Construct directory path with saveDirectory/id/currentDate
  const downloadDir = path.join(saveDirectory, id, currentDate);

  // Call aria2.addUri with the constructed directory path
  return await axiosPost("aria2.addUri", [
    [url],
    {
      dir: downloadDir,
      enableDHT: true,
      enablePeerExchange: true,
    },
  ]);
};

const getDownloadStatus = async (gid) => {
  return await axiosPost("aria2.tellStatus", [gid]);
};

const getOngoingDownloads = async () => {
  return await axiosPost("aria2.tellActive");
};

const cancelDownload = async (gid) => {
  return await axiosPost("aria2.remove", [gid]);
};

module.exports = {
  getVersion,
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
};
