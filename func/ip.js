const axios = require("axios");

export async function getIpData() {
    try {
      const response = await axios.get("http://ip-api.com/json/");
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }