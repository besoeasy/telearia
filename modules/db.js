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

function insertUrl(url, port) {
  try {
    const newUrl = Url.create({
      url,
      port,
    }).then((url) => {
      console.log(`Inserted url: ${url.url} with port: ${url.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getUrls() {
  const urls = await Url.findAll();
  return urls.map((url) => url.toJSON());
}

module.exports = { insertUrl, getUrls };
