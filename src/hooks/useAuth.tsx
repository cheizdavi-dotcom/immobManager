'use client';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
};

// This type is only for internal storage and includes the password.
type StoredUser = User & { password: string };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('immob_current_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const usersJson = localStorage.getItem('immob_users');
            const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];
            
            const foundUser = users.find(u => u.email === email && u.password === pass);

            if (foundUser) {
                const userToSave: User = { name: foundUser.name, email: foundUser.email };
                localStorage.setItem('immob_current_user', JSON.stringify(userToSave));
                setUser(userToSave);
                resolve();
            } else {
                reject(new Error('E-mail ou senha inválidos.'));
            }
        }, 500);
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
     return new Promise((resolve, reject) => {
         setTimeout(() => {
            const usersJson = localStorage.getItem('immob_users');
            const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

            if (users.some(u => u.email === email)) {
                return reject(new Error('Este e-mail já está em uso.'));
            }
            
            const newUser: StoredUser = { name, email, password: pass };
            users.push(newUser);
            localStorage.setItem('immob_users', JSON.stringify(users));
            resolve();
         }, 500)
     });
  };

  const logout = () => {
    localStorage.removeItem('immob_current_user');
    setUser(null);
    router.push('/auth');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
