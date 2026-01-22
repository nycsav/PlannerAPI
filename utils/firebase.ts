import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'plannerapi-prod'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'plannerapi-prod',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'plannerapi-prod'}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Email signup error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'Failed to log out');
  }
};

// Create or update user profile in Firestore
export const createUserProfile = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // Only create if doesn't exist
  if (!userSnap.exists()) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL || null,
      createdAt: Timestamp.now(),
      tier: 'free', // free, pro, enterprise
      savedBriefsCount: 0,
      lastActive: Timestamp.now(),
    };

    try {
      await setDoc(userRef, userData);
      console.log('User profile created:', userData);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  } else {
    // Update last active
    try {
      await setDoc(userRef, { lastActive: Timestamp.now() }, { merge: true });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
