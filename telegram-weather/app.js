import http from "node:http";
import { Bot } from "node-telegram-bot-api";
import { run } from "node-telegram-bot-api/node";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const { BOT_TOKEN, WEATHER_API_TOKEN, PORT = 3000 } = process.env;
const BTN_3H = "With a 3-hour interval";
const BTN_6H = "With a 6-hour interval";
const userCities = new Map();

async function getForecast(city, step) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang="uk"&appid=${WEATHER_API_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) return `City "${city}" not found. Send another city:`;

  const { list, city: info } = await res.json();

  const lines = list
    .filter((_, i) => i % step === 0)
    .map(({ dt_txt, main, weather }) => {
      const temp = Math.round(main.temp);
      return `${dt_txt.slice(0, 16)} | ${temp > 0 ? "+" : ""}${temp}°C, ${weather[0].description}`;
    });

  return `Weather in ${info.name}:\n\n${lines.join("\n")}`;
}

const bot = new Bot(BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Hi! Send a city name:"));

bot.on("message", async (ctx) => {
  const text = ctx.message.text?.trim();
  if (!text) return;

  const city = userCities.get(ctx.chatId);

  if (city && text === `Weather forecast in ${city}`) {
    return ctx.reply("Choose interval:", {
      reply_markup: {
        keyboard: [[{ text: BTN_3H }, { text: BTN_6H }]],
        resize_keyboard: true,
      },
    });
  }

  if (text === BTN_3H || text === BTN_6H) {
    if (!city) return ctx.reply("Send a city name first.");
    return ctx.reply(await getForecast(city, text === BTN_6H ? 2 : 1));
  }

  userCities.set(ctx.chatId, text);
  return ctx.reply(`City set to ${text}. Choose an option:`, {
    reply_markup: {
      keyboard: [[{ text: `Weather forecast in ${text}` }]],
      resize_keyboard: true,
    },
  });
});

http.createServer((_, res) => res.end("OK")).listen(PORT);
await run(bot);
