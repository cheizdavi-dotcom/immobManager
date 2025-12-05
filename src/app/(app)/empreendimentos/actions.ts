'use server';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import type { Development } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type DevelopmentFormData = Omit<Development, 'id' | 'userId'>;

/**
 * Busca todos os empreendimentos de um usuário específico no Firestore.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para um array de empreendimentos.
 */
export async function getDevelopments(userId: string): Promise<Development[]> {
  if (!userId) {
    console.log("getDevelopments: Tentativa de buscar empreendimentos sem ID de usuário.");
    return [];
  }
  try {
    const q = query(collection(db, 'developments'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const developments: Development[] = [];
    querySnapshot.forEach((doc) => {
      developments.push({ id: doc.id, ...doc.data() } as Development);
    });
    return developments;
  } catch (error) {
    console.error('Falha ao buscar empreendimentos do Firestore:', error);
    throw new Error('Não foi possível carregar os empreendimentos do banco de dados.');
  }
}

/**
 * Adiciona um novo empreendimento ou atualiza um existente no Firestore.
 * @param devData - Os dados do empreendimento do formulário.
 * @param userId - O ID do usuário logado.
 * @param devId - (Opcional) O ID do empreendimento para atualizar.
 * @returns Uma promessa que resolve para o empreendimento salvo.
 */
export async function addOrUpdateDevelopment(
  devData: DevelopmentFormData,
  userId: string,
  devId?: string
): Promise<Development> {
  if (!userId) {
    throw new Error('Usuário não autenticado. Ação não permitida.');
  }

  try {
    if (devId) {
      // Atualizar empreendimento existente
      const devRef = doc(db, 'developments', devId);
      await updateDoc(devRef, { ...devData });
      
      const updatedDevelopment: Development = { id: devId, userId, ...devData };
      revalidatePath('/(app)/empreendimentos');
      return updatedDevelopment;

    } else {
      // Inserir novo empreendimento
      const docRef = await addDoc(collection(db, 'developments'), {
        ...devData,
        userId: userId,
        created_at: new Date(),
      });

      const newDevelopment: Development = { id: docRef.id, userId, ...devData };
      revalidatePath('/(app)/empreendimentos');
      return newDevelopment;
    }
  } catch (error) {
    console.error('Falha ao salvar empreendimento no Firestore:', error);
    throw new Error('Não foi possível salvar o empreendimento no banco de dados.');
  }
}

/**
 * Exclui um empreendimento do Firestore.
 * @param devId - O ID do empreendimento a ser excluído.
 * @param userId - O ID do usuário logado (usado para verificação de permissão).
 * @returns Uma promessa que resolve quando a operação é concluída.
 */
export async function deleteDevelopment(devId: string, userId: string): Promise<void> {
  if (!devId) {
    throw new Error('ID do empreendimento não fornecido.');
  }
  if (!userId) {
    throw new Error('Usuário não autenticado. Ação não permitida.');
  }

  // TODO: Adicionar lógica para verificar se o empreendimento está associado a uma venda
  
  try {
    const devRef = doc(db, 'developments', devId);
    await deleteDoc(devRef);
    revalidatePath('/(app)/empreendimentos');
  } catch (error) {
    console.error('Falha ao excluir empreendimento do Firestore:', error);
    throw new Error('Não foi possível excluir o empreendimento do banco de dados.');
  }
}
