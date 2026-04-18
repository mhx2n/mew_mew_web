import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const APP_NAME = process.env.APP_NAME || 'Mew Mew Quiz Bot';

if (!BOT_TOKEN) {
  throw new Error('Missing BOT_TOKEN environment variable');
}

if (!WEB_APP_URL) {
  throw new Error('Missing WEB_APP_URL environment variable');
}

const bot = new TelegramBot(BOT_TOKEN);

const welcomeMessage = (chatId: string) => `স্বাগতম!

আপনি এখন ${APP_NAME} ব্যবহার করছেন।
এই বটের মাধ্যমে সহজেই কুইজ তৈরি করে Telegram-এ শেয়ার করতে পারবেন।

Web App ব্যবহার করুন:
${WEB_APP_URL}

আপনার Chat ID: \`${chatId}\`
এই ID টি কপি করে Web App-এর Settings-এ বসান।

কিভাবে ব্যবহার করবেন:
1️⃣ Web App-এ প্রবেশ করুন
2️⃣ আপনার টেক্সট / নোট পেস্ট করুন
3️⃣ Generate Quiz বাটনে ক্লিক করুন
4️⃣ Settings-এ গিয়ে আপনার Chat ID বসান
5️⃣ Send to Channel চাপ দিয়ে Telegram-এ পাঠান`;

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const update = req.body;
      const msg = update.message || update.channel_post;

      if (msg && msg.text) {
        const chatId = msg.chat.id.toString();
        const text = msg.text.trim();

        console.log(`Received message from ${chatId}: ${text}`);

        if (text.startsWith('/start')) {
          await bot.sendMessage(chatId, welcomeMessage(chatId), {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          });
        } else if (text.startsWith('/id') || text.startsWith('/chatid')) {
          await bot.sendMessage(
            chatId,
            `আপনার Chat ID হলো: \`${chatId}\`\nএটি কপি করে Web App-এর Settings-এ বসান।`,
            { parse_mode: 'Markdown' }
          );
        }
      }
    } catch (error) {
      console.error(error);
    }

    res.status(200).send('OK');
    return;
  }

  res.status(200).send('Webhook is active');
}
