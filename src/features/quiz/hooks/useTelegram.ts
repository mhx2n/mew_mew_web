import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizQuestion, TelegramSettings } from '../../../types';
import { sendQuizToTelegram } from '../services/telegramPollService';
import { useAuth } from '../../auth/hooks/useAuth';
import { getEffectiveSettings } from '../../settings/utils/settingsUtils';
import { updateUserStats } from '../services/quizService';

interface UseTelegramProps {
  settings: TelegramSettings;
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>;
  botToken: string;
}

export function useTelegram({ settings, questions, setQuestions, setStats, botToken }: UseTelegramProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSendToTelegram = async (id: string) => {
    const target = (user && settings.selectedChannelIds?.length) ? settings.selectedChannelIds : [settings.activeChannelId || settings.chatId || ''];
    if (target.length === 1 && !target[0]) {
      setSendError('Please configure your Telegram Chat ID in settings.');
      navigate('/settings');
      return;
    }
    setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'sending' } : q));
    const qToSend = questions.find(q => q.id === id);
    if (!qToSend) return;
    try {
      for (const chatId of target) {
        if (!chatId) continue;
        await sendQuizToTelegram(qToSend, getEffectiveSettings(settings, chatId, botToken, user), chatId);
        if (target.length > 1) await new Promise(r => setTimeout(r, 500));
      }
      setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'sent' } : q));
      setStats(p => {
        const s = { ...p, sent: p.sent + 1 };
        if (user) {
          updateUserStats(user.uid, s);
        } else {
          localStorage.setItem('quizStats', JSON.stringify(s));
        }
        return s;
      });
    } catch (err: any) {
      setSendError(`Failed to send: ${err.message}`);
      setQuestions(p => p.map(q => q.id === id ? { ...q, status: 'error' } : q));
    }
  };

  const handleSendAll = async (qs: QuizQuestion[]) => {
    const sortedQs = [...qs].sort((a, b) => {
      if (a.type === 'header' && b.type !== 'header') return -1;
      if (a.type !== 'header' && b.type === 'header') return 1;
      return 0;
    });
    for (const q of sortedQs.filter(q => q.status !== 'sending')) {
      await handleSendToTelegram(q.id);
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  const handleSendSelected = async (ids: string[]) => {
    const selectedQs = questions
      .filter(q => ids.includes(q.id) && q.status !== 'sending')
      .sort((a, b) => {
        if (a.type === 'header' && b.type !== 'header') return -1;
        if (a.type !== 'header' && b.type === 'header') return 1;
        return 0;
      });
    for (const q of selectedQs) {
      await handleSendToTelegram(q.id);
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  return { handleSendToTelegram, handleSendAll, handleSendSelected, sendError, setSendError };
}
