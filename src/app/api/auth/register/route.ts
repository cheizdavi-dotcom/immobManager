import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validação básica dos campos
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Verificar se o e-mail já existe
    const checkUserStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = checkUserStmt.get(email);

    if (existingUser) {
      return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 409 }); // 409 Conflict
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const id = randomUUID();
    const photoUrl = `https://picsum.photos/seed/${id}/200/200`; // Gera uma foto de perfil aleatória

    const insertStmt = db.prepare(
      'INSERT INTO users (id, name, email, password_hash, photoUrl) VALUES (?, ?, ?, ?, ?)'
    );
    
    insertStmt.run(id, name, email, password_hash, photoUrl);
    
    // Retornar usuário criado (sem a senha)
    const newUser = { id, name, email, photoUrl };

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
