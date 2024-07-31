const axios = require("axios");

const path = require("path");

const { saveDirectory, aria2server } = require("./utils.js");

const axiosPost = async (method, params = []) => {
  const { data } = await axios.post(aria2server, {
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
  return await axiosPost("aria2.addUri", [
    [url],
    {
      dir: path.join(saveDirectory, id),
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