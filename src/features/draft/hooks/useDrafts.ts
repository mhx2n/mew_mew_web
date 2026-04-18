import { useState, useEffect } from 'react';
import { QuizQuestion } from '../../../types';
import { useAuth } from '../../auth/hooks/useAuth';
import { subscribeToDrafts, saveDraft, deleteDraft, batchSaveDrafts } from '../services/draftService';
import { saveQuiz } from '../../quiz/services/quizService';

export function useDrafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToDrafts(user.uid, setDrafts);
    return () => unsubscribe();
  }, [user]);

  const moveToDraft = async (question: QuizQuestion) => {
    if (!user) return;
    await saveDraft(user.uid, question);
  };

  const moveManyToDraft = async (questions: QuizQuestion[]) => {
    if (!user) return;
    await batchSaveDrafts(user.uid, questions);
  };

  const sendDraftToTelegram = async (draft: QuizQuestion, sendFn: (q: QuizQuestion) => Promise<boolean>) => {
    if (!user) return;
    const success = await sendFn(draft);
    if (success) {
      await saveQuiz(user.uid, { ...draft, status: 'sent' });
      await deleteDraft(draft.id);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    console.log('handleDeleteDraft called with ID:', id);
    if (!id) {
      console.error('handleDeleteDraft: No ID provided');
      return;
    }
    try {
      await deleteDraft(id);
      console.log('handleDeleteDraft: Successfully called service for ID:', id);
    } catch (error) {
      console.error('handleDeleteDraft: Error calling service for ID:', id, error);
    }
  };

  return { drafts, moveToDraft, moveManyToDraft, sendDraftToTelegram, deleteDraft: handleDeleteDraft };
}
