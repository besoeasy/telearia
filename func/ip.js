const axios = require("axios");

async function getIpData() {
  try {
    const { data } = await axios.get("http://ip-api.com/json/");
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

module.exports = {
  getIpData,
};
