import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('Missing BOT_TOKEN environment variable');
}

const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(req: any, res: any) {
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const url = `${protocol}://${host}/api/webhook`;

  try {
    await bot.setWebHook(url);
    res.status(200).send(`✅ Webhook successfully set to: ${url}`);
  } catch (error: any) {
    res.status(500).send(`❌ Error setting webhook: ${error.message}`);
  }
}
