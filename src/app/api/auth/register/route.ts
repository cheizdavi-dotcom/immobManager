import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const photoUrl = `https://picsum.photos/seed/${email}/200/200`;

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      photoURL: photoUrl,
    });
    
    // Opcional: Salvar dados adicionais no Firestore se necessário.
    // Por exemplo, em uma coleção 'users'.
    // await db.collection('users').doc(userRecord.uid).set({ name, email, photoUrl });

    const newUser = {
        id: userRecord.uid,
        name: userRecord.displayName || name,
        email: userRecord.email,
        photoUrl: userRecord.photoURL || photoUrl,
    };

    return NextResponse.json(newUser, { status: 201 });

  } catch (error: any) {
    console.error('Register API Error:', error);
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
