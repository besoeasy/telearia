const axios = require("axios");

const getWeather = async (latitude, longitude) => {
  const data = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
  );

  return {
    temperature: data.data.current.temperature_2m,
  };
};

module.exports = {
  getWeather,
};
