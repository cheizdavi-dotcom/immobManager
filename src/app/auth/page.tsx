'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('user', null);
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    if(currentUser) {
        router.push('/dashboard');
    }
  }, [currentUser, router]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    const user = users.find(u => u.email === values.email && u.password === values.password);
    if (user) {
      setCurrentUser(user);
      toast({ title: 'Login bem-sucedido!', description: 'Redirecionando...' });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description: 'E-mail ou senha inválidos.',
      });
    }
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    if (users.some(u => u.email === values.email)) {
      toast({
        variant: 'destructive',
        title: 'Falha no cadastro',
        description: 'Este e-mail já está em uso.',
      });
      return;
    }
    const newUser: User = {
      id: new Date().toISOString(),
      name: values.name,
      email: values.email,
      password: values.password, // Storing password directly, NOT for production
      photoUrl: ''
    };
    setUsers([...users, newUser]);
    toast({
      title: 'Cadastro realizado com sucesso!',
      description: 'Você já pode fazer o login.',
    });
    loginForm.setValue('email', values.email);
    loginForm.setValue('password', '');
    setIsLogin(true);
    registerForm.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="size-7 text-primary" />
                <h1 className="text-2xl font-bold">ImmobManager</h1>
            </div>
            <CardTitle className="text-2xl">
                {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
            </CardTitle>
            <CardDescription>
                {isLogin
                ? 'Insira seus dados para continuar.'
                : 'Preencha o formulário para se cadastrar.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-register">Nome</Label>
                <Input
                  id="name-register"
                  placeholder="Seu nome completo"
                  {...registerForm.register('name')}
                />
                 {registerForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">E-mail</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="seu@email.com"
                  {...registerForm.register('email')}
                />
                 {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Senha</Label>
                <Input
                  id="password-register"
                  type="password"
                  {...registerForm.register('password')}
                />
                 {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                 {registerForm.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Entre'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
