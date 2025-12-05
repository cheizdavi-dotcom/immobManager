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
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center p-8">
            <div className="flex w-full h-full">
              <Skeleton className="h-full w-64 rounded-xl" />
              <div className="flex flex-col flex-1 pl-8 gap-8">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-32 w-1/3 rounded-xl" />
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            </div>
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
