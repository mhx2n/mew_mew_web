import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../../backend/firebase';
import { createUserProfile, signUpWithEmail, signInWithEmail } from '../services/authService';
import { doc, onSnapshot } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../constants';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up onAuthStateChanged listener...");
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        console.log("Auth state changed:", currentUser ? `User: ${currentUser.uid}` : "No user");
        setUser(currentUser);
        
        if (currentUser) {
          console.log("User logged in, ensuring profile exists...");
          await createUserProfile(currentUser);
          
          // Listen for real-time profile updates
          unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data());
            }
          }, (error) => {
            console.error("Error in profile snapshot listener:", error);
          });
        } else {
          setProfile(null);
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
        }
      } catch (error: any) {
        console.error("Error in onAuthStateChanged:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email));
  
  // Create a merged user object that includes permissions from profile
  // Memoize it to prevent infinite re-render loops in components using this hook
  const mergedUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      ...profile,
      uid: user.uid, // ensure uid is preserved
      email: user.email // ensure email is preserved
    };
  }, [user?.uid, profile]);

  const loginWithEmail = async (email: string, password: string) => {
    return await signInWithEmail(email, password);
  };

  const signUpWithEmailAuth = async (email: string, password: string) => {
    return await signUpWithEmail(email, password);
  };

  const logout = async () => {
    try {
      localStorage.clear();
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return { user: mergedUser, profile, isAdmin, loading, loginWithEmail, signUpWithEmailAuth, logout };
}
