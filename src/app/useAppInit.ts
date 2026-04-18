import { useSettings } from '../features/settings/hooks/useSettings';
import { useQuiz } from '../features/quiz/hooks/useQuiz';
import { useTelegram } from '../features/quiz/hooks/useTelegram';

export const FIXED_BOT_TOKEN = "8783681142:AAEtAX66CEYfML0gx3ojJO1fLY01kPJORH4";

export function useAppInit() {
  const settings = useSettings();
  const quiz = useQuiz();

  const telegram = useTelegram({
    settings: settings.settings,
    questions: quiz.questions,
    setQuestions: quiz.setQuestions,
    setStats: quiz.setStats,
    botToken: FIXED_BOT_TOKEN
  });

  const pendingQuestions = quiz.questions.filter(q => q.status !== 'sent');
  const sentQuestions = quiz.questions.filter(q => q.status === 'sent');

  return {
    settings,
    quiz,
    telegram,
    pendingQuestions,
    sentQuestions,
    botToken: FIXED_BOT_TOKEN
  };
}
