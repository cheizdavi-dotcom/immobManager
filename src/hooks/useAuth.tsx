'use client';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
};

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
      const storedUser = localStorage.getItem('user');
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
            const storedUser = localStorage.getItem('user');
            const storedPass = localStorage.getItem('password');

            if (storedUser) {
                const parsedUser: User = JSON.parse(storedUser);
                if (parsedUser.email === email && storedPass === pass) {
                    setUser(parsedUser);
                    resolve();
                } else {
                    reject(new Error('E-mail ou senha inválidos.'));
                }
            } else {
                 reject(new Error('Nenhum usuário cadastrado com este e-mail.'));
            }
        }, 500);
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
     return new Promise((resolve, reject) => {
         setTimeout(() => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser: User = JSON.parse(storedUser);
                if(parsedUser.email === email) {
                    return reject(new Error('Este e-mail já está em uso.'));
                }
            }
            const newUser: User = { name, email };
            localStorage.setItem('user', JSON.stringify(newUser));
            localStorage.setItem('password', pass);
            resolve();
         }, 500)
     });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('password');
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
