'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '@/lib/firebase';
import { Landing } from '@/components/Landing';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: loginWithGoogle, logout }}>
      {loading ? (
        <div className="min-h-dvh bg-[var(--paper)] flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] animate-pulse" />
        </div>
      ) : user ? (
        children
      ) : (
        <Landing />
      )}
    </AuthContext.Provider>
  );
}
