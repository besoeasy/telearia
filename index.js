#!/usr/bin/env node

require("dotenv").config();

const startServer = require("./func/express.js");

const { Telegraf } = require("telegraf");

if (!process.env.TELEGRAMBOT) {
  console.error("TELEGRAMBOT Environment Variable is not set !");
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAMBOT);

const {
  handleAbout,
  handleStart,
  handleStats,
  handleDownload,
  handleStatus,
  handleCancel,
  handleIpData,
  handleClean,
  downloading,
} = require("./func/handler.js");

bot.on("message", async (ctx) => {
  if (ctx.message.text) {
    try {
      const { text } = ctx.message;
      const [command, ...args] = text.split(" ");
      const lowerCaseCommand = command.toLowerCase().trim();
      const trimmedArgs = args.map((arg) => arg.trim());

      console.log(`@${ctx.from.username} (ID: ${ctx.from.id}): ${text}`);

      switch (lowerCaseCommand) {
        case "/clean":
          handleClean(ctx);
          break;
        case "/about":
          handleAbout(ctx);
          break;
        case "/start":
          handleStart(ctx);
          break;
        case "/stats":
          handleStats(ctx);
          break;
        case "/downloading":
          downloading(ctx);
          break;
        case "/ip":
          handleIpData(ctx);
          break;
        case "/download":
        case "/dl":
          if (trimmedArgs.length > 0) handleDownload(ctx, trimmedArgs[0]);
          else ctx.reply("Please provide a URL to download.");
          break;
        default:
          if (lowerCaseCommand.startsWith("/status_"))
            handleStatus(ctx, lowerCaseCommand.split("_")[1]);
          else if (lowerCaseCommand.startsWith("/cancel_"))
            handleCancel(ctx, lowerCaseCommand.split("_")[1]);
          else
            ctx.reply(
              `Unknown command: ${lowerCaseCommand}\n\nType /start to see available commands.`
            );
      }
    } catch (error) {
      console.error(error);
      ctx.reply("An error occurred. Please try again later.");
    }
  }
});

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

 try {
    bot.launch();
    console.log("Bot started successfully.");
    startServer();
  } catch (error) {
    console.error("Error launching bot:", error);
  }
