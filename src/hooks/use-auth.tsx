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
        <div className="flex flex-col min-h-screen">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 md:px-6">
                <Skeleton className="h-8 w-32" />
                <div className="ml-auto flex items-center gap-4">
                    <Skeleton className="h-9 w-20 hidden md:block" />
                    <Skeleton className="h-9 w-20 hidden md:block" />
                    <Skeleton className="h-9 w-24 hidden md:block" />
                    <Skeleton className="h-9 w-32 hidden md:block" />
                </div>
            </div>
            {/* Page Skeleton */}
            <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </main>
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
