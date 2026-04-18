import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from '../../../backend/firebase';
import { User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../../../lib/firestoreUtils';
import { ADMIN_EMAILS } from '../constants';

export const createUserProfile = async (user: User) => {
  try {
    console.log("Checking user profile for:", user.uid);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.log("Creating new user profile...");
      const defaultRole = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: defaultRole,
        createdAt: serverTimestamp()
      });
      console.log("User profile created successfully with role:", defaultRole);
    } else {
      console.log("User profile already exists");
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users/' + user.uid);
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users/' + uid);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-up for:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user);
    console.log("Email sign-up successful");
    return userCredential.user;
  } catch (error) {
    console.error("Error in signUpWithEmail:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting email sign-in for:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful");
    return userCredential.user;
  } catch (error) {
    console.error("Error in signInWithEmail:", error);
    throw error;
  }
};

export const deleteUserAccount = async (user: User, password: string) => {
  try {
    console.log("Attempting to delete user account...");
    const credential = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, credential);
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
    console.log("User account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};
