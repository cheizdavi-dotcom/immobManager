'use server';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Corretor } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type CorretorFormData = Omit<Corretor, 'id' | 'userId'>;

/**
 * Busca todos os corretores de um usuário específico no Firestore.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para um array de corretores.
 */
export async function getCorretores(userId: string): Promise<Corretor[]> {
  if (!userId) {
    return [];
  }
  try {
    const q = query(collection(db, 'corretores'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const corretores: Corretor[] = [];
    querySnapshot.forEach((doc) => {
      corretores.push({ id: doc.id, ...doc.data() } as Corretor);
    });
    return corretores;
  } catch (error) {
    console.error('Falha ao buscar corretores do Firestore:', error);
    throw new Error('Não foi possível carregar os corretores.');
  }
}

/**
 * Adiciona um novo corretor ou atualiza um existente no Firestore.
 * @param corretorData - Os dados do corretor do formulário.
 * @param userId - O ID do usuário logado.
 * @param corretorId - (Opcional) O ID do corretor para atualizar.
 * @returns Uma promessa que resolve para o corretor salvo.
 */
export async function addOrUpdateCorretor(
  corretorData: CorretorFormData,
  userId: string,
  corretorId?: string
): Promise<Corretor> {
  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }

  try {
    if (corretorId) {
      const corretorRef = doc(db, 'corretores', corretorId);
      await updateDoc(corretorRef, { ...corretorData });
      revalidatePath('/(app)/corretores');
      return { id: corretorId, userId, ...corretorData };
    } else {
      const docRef = await addDoc(collection(db, 'corretores'), {
        ...corretorData,
        userId: userId,
      });
      revalidatePath('/(app)/corretores');
      return { id: docRef.id, userId, ...corretorData };
    }
  } catch (error) {
    console.error('Falha ao salvar corretor no Firestore:', error);
    throw new Error('Não foi possível salvar o corretor.');
  }
}

/**
 * Exclui um corretor do Firestore.
 * @param corretorId - O ID do corretor a ser excluído.
 * @param userId - O ID do usuário logado.
 */
export async function deleteCorretor(corretorId: string, userId: string): Promise<void> {
  if (!corretorId || !userId) {
    throw new Error('ID do corretor ou do usuário não fornecido.');
  }

  // Verifica se o corretor possui vendas associadas
  const salesQuery = query(collection(db, 'sales'), where('corretorId', '==', corretorId), where('userId', '==', userId));
  const salesSnapshot = await getDocs(salesQuery);
  
  if (!salesSnapshot.empty) {
    throw new Error('Não é possível excluir um corretor que já possui vendas registradas.');
  }

  try {
    const corretorRef = doc(db, 'corretores', corretorId);
    await deleteDoc(corretorRef);
    revalidatePath('/(app)/corretores');
  } catch (error) {
    console.error('Falha ao excluir corretor do Firestore:', error);
    throw new Error('Não foi possível excluir o corretor.');
  }
}
