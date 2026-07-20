'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

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
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-cyan-400">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : user ? (
        children
      ) : (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 font-sans p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center shadow-2xl">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">FlipBuilder BR</h1>
            <p className="text-zinc-400 text-center mb-8">Ferramenta de planejamento e orçamentos de PCs Gamer.</p>
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Entrar com Google
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
