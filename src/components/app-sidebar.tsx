'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Banknote,
  Building,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState, useContext } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { FirebaseContext } from '../firebase/provider';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/vendas',
    label: 'Vendas',
    icon: TrendingUp,
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: Users,
  },
  {
    href: '/empreendimentos',
    label: 'Empreendimentos',
    icon: Building,
  },
  {
    href: '/corretores',
    label: 'Corretores',
    icon: Users,
  },
  {
    href: '/financeiro',
    label: 'Financeiro',
    icon: Banknote,
  },
];

// HOOKS MOVED HERE TO FIX IMPORT ISSUES
function useAuthFromContext() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

function useUser() {
  const auth = useAuthFromContext();
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

export function AppSidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const auth = useAuthFromContext();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/auth');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-7" />
          <span className="text-xl font-semibold">ImmobManager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-md p-2 text-left hover:bg-sidebar-accent">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar className="size-8">
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt="User" />}
                  <AvatarFallback>{getInitials(user?.displayName || user?.email)}</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium">
                  {user?.displayName || user?.email || 'Admin'}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="top" align="start">
            <DropdownMenuLabel>{user?.email || 'Minha Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
            <DropdownMenuItem disabled>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
