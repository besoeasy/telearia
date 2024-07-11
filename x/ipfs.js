const axios = require("axios");

const ipfs_api = "http://127.0.0.1:5001/api/v0/";

async function ipfsAgent() {
  try {
    const response = await axios.post(ipfs_api + "id");
    const data = response.data;

    return {
      AgentVersion: data.AgentVersion,
      ID: data.ID,
      PublicKey: data.PublicKey,
    };
  } catch (error) {
    console.error("Error fetching agent version:", error);
  }
}

async function ipfsStats() {
  try {
    const response = await axios.post(ipfs_api + "stats/bw");
    const data = response.data;

    return {
      TotalIn: data.TotalIn,
      TotalOut: data.TotalOut,
    };
  } catch (error) {
    console.error("Error fetching agent version:", error);
  }
}

module.exports = {
  ipfsAgent,
  ipfsStats,
};
