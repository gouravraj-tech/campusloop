"use client";

import { useEffect, useState } from "react";

export type CampusUser = {
  uid: string;
  name: string;
  email: string;
  college: string;
  token: string;
};

const STORAGE_KEY = "campusloop-auth";

export function useAuth() {
  const [user, setUser] = useState<CampusUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    user,
    ready,
    login: saveUser,
    logout: () => saveUser(null),
  };
}
