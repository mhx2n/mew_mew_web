import { TelegramSettings } from "../../../types";

export const getEffectiveSettings = (settings: TelegramSettings, chatId: string, botToken: string, user: any) => {
  let cp = settings.questionPrefix, cs = settings.explanationSuffix;
  const ch = settings.channels?.find(c => c.id === chatId);
  if (ch) {
    if (ch.activePrefixId === 'none') cp = '';
    else if (ch.activePrefixId) cp = settings.prefixes?.find(p => p.id === ch.activePrefixId)?.content || cp;
    if (ch.activeSuffixId === 'none') cs = '';
    else if (ch.activeSuffixId) cs = settings.suffixes?.find(s => s.id === ch.activeSuffixId)?.content || cs;
  }
  return { ...settings, botToken, questionPrefix: user ? cp : undefined, explanationSuffix: user ? cs : undefined };
};
