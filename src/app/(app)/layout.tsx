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
import { useEffect } from 'react';
import { useUser } from '../../firebase';
import { Loader } from 'lucide-react';


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
