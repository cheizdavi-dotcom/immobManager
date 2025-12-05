import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    // Encontrar usuário pelo e-mail
    const getUserStmt = db.prepare('SELECT id, name, email, password_hash, photoUrl FROM users WHERE email = ?');
    const user = getUserStmt.get(email) as { id: string; name: string; email: string; password_hash: string; photoUrl: string; } | undefined;

    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 }); // 401 Unauthorized
    }

    // Comparar a senha fornecida com o hash armazenado
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // Se a senha estiver correta, retorne os dados do usuário (exceto o hash da senha)
    const { password_hash, ...userToReturn } = user;

    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
