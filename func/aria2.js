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

export const getVersion = async () => {
  return await axiosPost("aria2.getVersion");
};

export const getGlobalStats = async () => {
  return await axiosPost("aria2.getGlobalStat");
};

export const downloadAria = async (id, url) => {
  return await axiosPost("aria2.addUri", [
    [url],
    {
      dir: path.join(saveDirectory, id),
      enableDHT: true,
      enablePeerExchange: true,
    },
  ]);
};

export const getDownloadStatus = async (gid) => {
  return await axiosPost("aria2.tellStatus", [gid]);
};

export const getOngoingDownloads = async () => {
  return await axiosPost("aria2.tellActive");
};

export const cancelDownload = async (gid) => {
  return await axiosPost("aria2.remove", [gid]);
};