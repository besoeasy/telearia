function checkifurlValid(url) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(url);
}

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
});

const Url = sequelize.define("Url", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

(async () => {
  await sequelize.sync({ force: true });
})();

async function insertUrl(url, port) {
  try {
    if (!checkifurlValid(url)) {
      console.log("Invalid URL");
      return;
    }

    const existingUrl = await Url.findOne({ where: { url: url } });
    if (existingUrl) {
      console.log("URL already present");
      return;
    } else {
      await Url.create({
        url,
        port,
      });
      console.log(`Inserted url: ${url} with port: ${port}`);
    }
  } catch (error) {
    console.error(`Error inserting URL: ${error}`);
  }
}

async function getUrls() {
  const urls = await Url.findAll();
  return urls.map((url) => url.toJSON());
}

module.exports = { insertUrl, getUrls };
