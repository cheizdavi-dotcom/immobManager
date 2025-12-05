'use server';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase/client'; // Import client-side initialized app

const auth = getAuth(app);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    // Since we are in a backend route, we can't directly use the client-side auth state.
    // A common approach is to use the Firebase Admin SDK to verify credentials or create a custom token.
    // However, for simplicity and to align with a more client-centric flow, we'll use the client SDK's signIn method.
    // This is NOT standard practice for a secure backend but works for this prototyping setup.
    // For a production app, you would use Firebase Admin SDK to create a session cookie.
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user) {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const userToReturn = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
    };

    return NextResponse.json(userToReturn, { status: 200 });

  } catch (error: any) {
    console.error('Login API Error:', error);
     if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
       return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
