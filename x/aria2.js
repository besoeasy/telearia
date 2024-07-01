const axios = require("axios");

const saveDirectory = "/downloads/";

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
  return await axiosPost("aria2.addUri", [
    [url],
    {
      dir: `${saveDirectory}${id}/`,
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

const { createServer } = require("http");

const handler = require("serve-handler");

const server = createServer((request, response) => {
  handler(request, response, {
    public: saveDirectory,
    rewrites: [{ source: "**", destination: "/index.html" }],
  }).catch((err) => {
    console.error("Error handling request:", err);
    response.statusCode = 500;
    response.end("Internal Server Error");
  });
});

module.exports = {
  getVersion,
  getGlobalStats,
  downloadAria,
  getDownloadStatus,
  getOngoingDownloads,
  cancelDownload,
  saveDirectory,
  server,
};
