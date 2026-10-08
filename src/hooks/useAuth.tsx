"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { getFirebaseClient } from "@/lib/firebase-client";

export type CampusUser = {
  uid: string;
  name: string;
  email: string;
  college: string;
  token: string;
};

const STORAGE_KEY = "campusloop-auth";

type AuthContextValue = {
  user: CampusUser | null;
  ready: boolean;
  login: (user: CampusUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CampusUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const firebase = getFirebaseClient();
    if (firebase) {
      const unsubscribe = onIdTokenChanged(firebase.auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setReady(true);
          return;
        }

        const token = await firebaseUser.getIdToken();
        let cachedUser: CampusUser | null = null;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as CampusUser;
            if (parsed.uid === firebaseUser.uid) {
              cachedUser = parsed;
            }
          } catch {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
        setUser({
          uid: firebaseUser.uid,
          name: cachedUser?.name || firebaseUser.displayName || firebaseUser.email || "Campus Student",
          email: firebaseUser.email || "",
          college: cachedUser?.college || "",
          token,
        });
        setReady(true);
      });
      return unsubscribe;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as CampusUser);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const saveUser = (nextUser: CampusUser | null) => {
    setUser(nextUser);
    if (getFirebaseClient()) {
      if (nextUser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...nextUser, token: "" }));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      return;
    }

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = async () => {
    const firebase = getFirebaseClient();
    if (firebase) {
      await signOut(firebase.auth);
    }
    saveUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login: saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
