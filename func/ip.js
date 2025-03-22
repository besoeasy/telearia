const axios = require("axios");

// Default configuration for axios
const apiClient = axios.create({
  baseURL: "http://ip-api.com",
  timeout: 5000, // 5-second timeout to avoid hanging
});

/**
 * Fetches IP data from ip-api.com
 * @returns {Object|null} IP data or null if the request fails
 */
async function getIpData() {
  try {
    const { data } = await apiClient.get("/json/");
    if (data.status === "fail") {
      throw new Error(data.message || "IP API request failed");
    }
    return {
      query: data.query,
      country: data.country,
      regionName: data.regionName,
      city: data.city,
      isp: data.isp,
    };
  } catch (error) {
    console.error("Failed to fetch IP data:", error.message);
    return null;
  }
}

module.exports = { getIpData };
