import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Hi! Send me anything."));

bot.on("message", (ctx) => {
  if (ctx.message.text.toLowerCase() === "photo") {
    console.log(`Користувач ${ctx.from.username} запросив картинку`);
    bot.api.sendPhoto({
      chat_id: ctx.chatId,
      photo: "https://picsum.photos/200/300",
    });
  } else {
    console.log(`Користувач ${ctx.from.username} написав ${ctx.message.text}`);
    ctx.reply(`Ви написали "${ctx.message.text}"`);
  }
});

await run(bot);
