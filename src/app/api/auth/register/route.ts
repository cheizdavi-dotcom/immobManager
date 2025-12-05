import { NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase/client';

const auth = getAuth(app);

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Use o client SDK para criar o usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Defina o nome e a foto do perfil
    const photoUrl = `https://picsum.photos/seed/${email}/200/200`;
    await updateProfile(user, {
      displayName: name,
      photoURL: photoUrl,
    });
    
    const newUser = {
        id: user.uid,
        name: user.displayName || name,
        email: user.email,
        photoUrl: user.photoURL || photoUrl,
    };

    return NextResponse.json(newUser, { status: 201 });

  } catch (error: any) {
    console.error('Register API Error:', error);
    if (error.code === 'auth/email-already-in-use') {
        return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
