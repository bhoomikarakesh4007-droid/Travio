import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createUserDocument, loadUserProfile, subscribeToUserProfile } from "../services/userService";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAccount(user, passengerName = "") {
    const userProfile = await createUserDocument(user, passengerName);
    setCurrentUser(user);
    setProfile(userProfile || await loadUserProfile(user));
    return user;
  }

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribeProfile();
      unsubscribeProfile = () => {};

      if (!user) {
        setCurrentUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        await loadAccount(user);
        unsubscribeProfile = subscribeToUserProfile(user, setProfile, () => {
          // Keep the last known profile during a transient Firestore error.
        });
      } catch {
        // Authentication remains usable if Firestore is temporarily unavailable.
        setCurrentUser(user);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeProfile();
    };
  }, []);

  async function signup(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return loadAccount(auth.currentUser || result.user, name);
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return loadAccount(result.user);
  }

  async function googleLogin() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return loadAccount(result.user);
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser,
      profile,
      loading,
      login,
      signup,
      googleLogin,
      logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };

// This hook is intentionally colocated with its provider for the public auth API.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
