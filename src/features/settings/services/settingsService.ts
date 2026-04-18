import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../backend/firebase';
import { TelegramSettings } from '../../../types';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';

export const fetchSettings = async (userId: string) => {
  try {
    console.log("Fetching settings for:", userId);
    const docRef = doc(db, 'settings', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as TelegramSettings) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/' + userId);
  }
};

export const saveSettings = async (userId: string, settings: TelegramSettings) => {
  try {
    console.log("Saving settings for:", userId);
    
    // Remove undefined values to prevent Firestore errors
    const sanitizedSettings = JSON.parse(JSON.stringify(settings));
    
    await setDoc(doc(db, 'settings', userId), {
      ...sanitizedSettings,
      userId: userId,
      updatedAt: serverTimestamp()
    });
    console.log("Settings saved successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/' + userId);
  }
};
