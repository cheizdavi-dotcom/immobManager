'use client';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { Loader } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { FirebaseContext } from '../../firebase/provider';

// HOOK MOVED HERE TO FIX IMPORT ISSUES
function useAuth() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

function useUser() {
  const auth = useAuth();
  const [userState, setUserState] = useState<{
    data: User | null;
    isLoading: boolean;
  }>({
    data: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!auth) {
        setUserState({ data: null, isLoading: false });
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserState({ data: user, isLoading: false });
    });
    return () => unsubscribe();
  }, [auth]);

  return userState;
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
