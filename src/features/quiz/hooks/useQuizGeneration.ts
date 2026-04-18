import React, { useState } from 'react';
import { QuizQuestion } from '../../../types';
import { generateQuizFromText } from '../services/geminiService';
import { batchSaveQuizzes, updateUserStats } from '../services/quizService';

export function useQuizGeneration(
  user: any,
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>,
  setStats: React.Dispatch<React.SetStateAction<{ generated: number; sent: number }>>
) {
  const [inputText, setInputText] = useState('');
  const [lastInputText, setLastInputText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (clearInput: boolean = true): Promise<boolean> => {
    const textToUse = inputText.trim() || lastInputText.trim();
    if (!textToUse) {
      setError('Please enter some text to generate a quiz.');
      return false;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const generated = await generateQuizFromText(textToUse, questionCount);
      const newQuestions: QuizQuestion[] = generated.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substring(7),
        status: 'pending'
      }));
      
      setQuestions(prev => [...newQuestions, ...prev]);
      
      if (user) {
        await batchSaveQuizzes(user.uid, newQuestions);
      }

      setStats(prev => {
        const newStats = { ...prev, generated: prev.generated + generated.length };
        if (user) {
          updateUserStats(user.uid, newStats);
        } else {
          localStorage.setItem('quizStats', JSON.stringify(newStats));
        }
        return newStats;
      });
      setLastInputText(textToUse);
      if (clearInput) {
        setInputText('');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMore = () => handleGenerate(false);

  return {
    inputText,
    setInputText,
    lastInputText,
    questionCount,
    setQuestionCount,
    isGenerating,
    error,
    setError,
    handleGenerate: () => handleGenerate(true),
    handleGenerateMore
  };
}
