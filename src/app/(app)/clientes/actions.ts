'use server';

import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import type { Client } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type ClientFormData = Omit<Client, 'id' | 'userId'>;

/**
 * Busca todos os clientes de um usuário específico no Firestore.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para um array de clientes.
 */
export async function getClients(userId: string): Promise<Client[]> {
  if (!userId) {
    console.log("getClients: Tentativa de buscar clientes sem ID de usuário.");
    return [];
  }
  try {
    const q = query(collection(db, 'clients'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    // Ordenar por data de criação, se houver (opcional, pode ser feito no query)
    // clients.sort((a, b) => b.created_at.toMillis() - a.created_at.toMillis());
    return clients;
  } catch (error) {
    console.error('Falha ao buscar clientes do Firestore:', error);
    throw new Error('Não foi possível carregar os clientes do banco de dados.');
  }
}

/**
 * Adiciona um novo cliente ou atualiza um existente no Firestore.
 * @param clientData - Os dados do cliente do formulário.
 * @param userId - O ID do usuário logado.
 * @param clientId - (Opcional) O ID do cliente para atualizar.
 * @returns Uma promessa que resolve para o cliente salvo.
 */
export async function addOrUpdateClient(
  clientData: ClientFormData,
  userId: string,
  clientId?: string
): Promise<Client> {
  if (!userId) {
    throw new Error('Usuário não autenticado. Ação não permitida.');
  }

  try {
    if (clientId) {
      // Atualizar cliente existente
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, { ...clientData });
      
      const updatedClient: Client = { id: clientId, userId, ...clientData };
      revalidatePath('/(app)/clientes');
      return updatedClient;

    } else {
      // Inserir novo cliente
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        userId: userId,
        created_at: new Date(), // Firestore usa objetos Date
      });

      const newClient: Client = { id: docRef.id, userId, ...clientData };
      revalidatePath('/(app)/clientes');
      return newClient;
    }
  } catch (error) {
    console.error('Falha ao salvar cliente no Firestore:', error);
    throw new Error('Não foi possível salvar o cliente no banco de dados.');
  }
}

/**
 * Exclui um cliente do Firestore.
 * @param clientId - O ID do cliente a ser excluído.
 * @param userId - O ID do usuário logado (usado para verificação de permissão).
 * @returns Uma promessa que resolve quando a operação é concluída.
 */
export async function deleteClient(clientId: string, userId: string): Promise<void> {
  if (!clientId) {
    throw new Error('ID do cliente não fornecido.');
  }
  if (!userId) {
    throw new Error('Usuário não autenticado. Ação não permitida.');
  }

  // TODO: Adicionar lógica para verificar se o cliente está associado a uma venda
  
  try {
    const clientRef = doc(db, 'clients', clientId);
    // Opcional: verificar se o 'userId' do documento corresponde antes de excluir (regra de segurança do Firestore é melhor)
    await deleteDoc(clientRef);
    revalidatePath('/(app)/clientes');
  } catch (error) {
    console.error('Falha ao excluir cliente do Firestore:', error);
    throw new Error('Não foi possível excluir o cliente do banco de dados.');
  }
}
