import { collection, doc, setDoc, getDocs, deleteDoc, query, where, writeBatch, serverTimestamp, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { QuizQuestion } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

export const fetchQuizzes = async (userId: string) => {
  try {
    const q = query(collection(db, 'quizzes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const loadedQuestions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      loadedQuestions.push(doc.data() as QuizQuestion);
    });
    return loadedQuestions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizzes');
  }
};

export const subscribeToQuizzes = (userId: string, callback: (quizzes: QuizQuestion[]) => void) => {
  const q = query(collection(db, 'quizzes'), where('userId', '==', userId));
  return onSnapshot(q, (querySnapshot) => {
    const loadedQuestions: QuizQuestion[] = [];
    querySnapshot.forEach((doc) => {
      loadedQuestions.push(doc.data() as QuizQuestion);
    });
    callback(loadedQuestions);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'quizzes');
  });
};

export const saveQuiz = async (userId: string, question: QuizQuestion) => {
  try {
    await setDoc(doc(db, 'quizzes', question.id), {
      ...question,
      userId: userId,
      createdAt: (question as any).createdAt || serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes/' + question.id);
  }
};

export const deleteQuiz = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'quizzes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'quizzes/' + id);
  }
};

export const batchSaveQuizzes = async (userId: string, questions: QuizQuestion[]) => {
  try {
    const batch = writeBatch(db);
    questions.forEach(q => {
      const docRef = doc(db, 'quizzes', q.id);
      batch.set(docRef, {
        ...q,
        userId: userId,
        createdAt: serverTimestamp()
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes');
  }
};

export const updateUserStats = async (userId: string, stats: { generated: number; sent: number }) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stats: stats
    });
  } catch (error) {
    // If update fails, try set with merge
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { stats }, { merge: true });
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.WRITE, 'users/' + userId);
    }
  }
};

export const subscribeToUserStats = (userId: string, callback: (stats: { generated: number; sent: number }) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.stats) {
        callback(data.stats);
      }
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'users/' + userId);
  });
};
