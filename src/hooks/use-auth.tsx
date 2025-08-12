
'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { FirestoreUser } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: FirestoreUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, email, displayName } = firebaseUser;
        setUser({ uid, email, displayName });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }

  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }
  
  const logOut = () => {
    return signOut(auth);
  }

  // Handle routing based on auth state
  useEffect(() => {
    if (!loading && !user && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  if (loading && pathname.startsWith('/dashboard')) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            {/* Sidebar Skeleton */}
            <div className="hidden border-r bg-muted/40 lg:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-[60px] items-center border-b px-6">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-4 text-sm font-medium">
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </nav>
                    </div>
                </div>
            </div>
            {/* Page Skeleton */}
            <div className="flex flex-col">
                <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
                    <Skeleton className="h-8 w-8 lg:hidden" />
                    <Skeleton className="h-8 w-32" />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-80" />
                </main>
            </div>
        </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
