'use server';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import type { Sale } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type SaleFormData = Omit<Sale, 'id' | 'userId' | 'commissionStatus'>;

/**
 * Busca todas as vendas de um usuário específico no Firestore.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para um array de vendas.
 */
export async function getSales(userId: string): Promise<Sale[]> {
  if (!userId) {
    return [];
  }
  try {
    const q = query(collection(db, 'sales'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const sales: Sale[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({ 
        id: doc.id, 
        ...data,
        // Garante que as datas sejam strings no formato ISO
        saleDate: data.saleDate.toDate().toISOString(),
        combinadoDate: data.combinadoDate ? data.combinadoDate.toDate().toISOString() : null,
      } as Sale);
    });
    return sales;
  } catch (error) {
    console.error('Falha ao buscar vendas do Firestore:', error);
    throw new Error('Não foi possível carregar as vendas.');
  }
}

/**
 * Adiciona uma nova venda ou atualiza uma existente no Firestore.
 * @param saleData - Os dados da venda do formulário.
 * @param userId - O ID do usuário logado.
 * @param saleId - (Opcional) O ID da venda para atualizar.
 * @returns Uma promessa que resolve para a venda salva.
 */
export async function addOrUpdateSale(
  saleData: SaleFormData,
  userId: string,
  saleId?: string
): Promise<Sale> {
  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }

  const dataToSave = {
    ...saleData,
    userId,
    // Converte as datas do formulário para objetos Date do Firestore
    saleDate: new Date(saleData.saleDate),
    combinadoDate: saleData.combinadoDate ? new Date(saleData.combinadoDate) : null,
  };

  try {
    if (saleId) {
      const saleRef = doc(db, 'sales', saleId);
      // Mantém o status da comissão se já existir
      const { commissionStatus, ...restOfData } = dataToSave as any;
      await updateDoc(saleRef, restOfData);
      revalidatePath('/(app)/vendas');
      revalidatePath('/(app)/dashboard');
      revalidatePath('/(app)/financeiro');
      
      const updatedSale: Sale = { id: saleId, ...saleData, userId, commissionStatus: commissionStatus || 'Pendente' };
      return updatedSale;

    } else {
      const docRef = await addDoc(collection(db, 'sales'), {
        ...dataToSave,
        commissionStatus: 'Pendente', // Status inicial
      });
      revalidatePath('/(app)/vendas');
      revalidatePath('/(app)/dashboard');
      revalidatePath('/(app)/financeiro');

      const newSale: Sale = { id: docRef.id, ...saleData, userId, commissionStatus: 'Pendente' };
      return newSale;
    }
  } catch (error) {
    console.error('Falha ao salvar venda no Firestore:', error);
    throw new Error('Não foi possível salvar a venda.');
  }
}

/**
 * Exclui uma venda do Firestore.
 * @param saleId - O ID da venda a ser excluída.
 * @param userId - O ID do usuário logado.
 */
export async function deleteSale(saleId: string, userId: string): Promise<void> {
  if (!saleId || !userId) {
    throw new Error('ID da venda ou do usuário não fornecido.');
  }
  
  try {
    const saleRef = doc(db, 'sales', saleId);
    await deleteDoc(saleRef);
    revalidatePath('/(app)/vendas');
    revalidatePath('/(app)/dashboard');
    revalidatePath('/(app)/financeiro');
  } catch (error) {
    console.error('Falha ao excluir venda do Firestore:', error);
    throw new Error('Não foi possível excluir a venda.');
  }
}

/**
 * Atualiza uma venda existente no Firestore (usado para ações pontuais como mudar status).
 * @param sale - O objeto da venda completo.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para a venda atualizada.
 */
export async function updateSale(sale: Sale, userId: string): Promise<Sale> {
  if (!userId || !sale.id) {
    throw new Error('Dados insuficientes para atualizar a venda.');
  }

  const { id, ...saleData } = sale;
  
  const dataToSave = {
    ...saleData,
    userId,
    saleDate: new Date(saleData.saleDate),
    combinadoDate: saleData.combinadoDate ? new Date(saleData.combinadoDate) : null,
  };

  try {
    const saleRef = doc(db, 'sales', id);
    await updateDoc(saleRef, dataToSave);
    revalidatePath('/(app)/vendas');
    revalidatePath('/(app)/dashboard');
    revalidatePath('/(app)/financeiro');
    return sale;
  } catch (error) {
    console.error('Falha ao atualizar venda no Firestore:', error);
    throw new Error('Não foi possível atualizar a venda.');
  }
}
