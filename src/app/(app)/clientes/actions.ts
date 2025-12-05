'use server';

import db from '@/lib/db';
import type { Client, ClientStatus } from '@/lib/types';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

// Tipagem para os dados do formulário, sem id e userId
type ClientFormData = Omit<Client, 'id' | 'userId'>;

/**
 * Busca todos os clientes de um usuário específico.
 * @param userId - O ID do usuário logado.
 * @returns Uma promessa que resolve para um array de clientes.
 */
export async function getClients(userId: string): Promise<Client[]> {
  try {
    const stmt = db.prepare('SELECT * FROM clients WHERE userId = ? ORDER BY created_at DESC');
    const clients = stmt.all(userId) as Client[];
    return clients;
  } catch (error) {
    console.error('Falha ao buscar clientes:', error);
    throw new Error('Não foi possível carregar os clientes do banco de dados.');
  }
}

/**
 * Adiciona um novo cliente ou atualiza um existente no banco de dados.
 * @param clientData - Os dados do cliente do formulário.
 * @param userId - O ID do usuário logado.
 * @param clientId - (Opcional) O ID do cliente para atualizar. Se não for fornecido, um novo cliente será criado.
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
  
  const id = clientId || randomUUID();
  
  const finalClient: Client = {
    ...clientData,
    id: id,
    userId: userId,
  };

  try {
    if (clientId) {
      // Atualizar cliente existente
      const stmt = db.prepare(
        'UPDATE clients SET name = ?, phone = ?, cpf = ?, status = ? WHERE id = ? AND userId = ?'
      );
      stmt.run(finalClient.name, finalClient.phone, finalClient.cpf, finalClient.status, id, userId);
    } else {
      // Inserir novo cliente
      const stmt = db.prepare(
        'INSERT INTO clients (id, userId, name, phone, cpf, status, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      );
      stmt.run(id, userId, finalClient.name, finalClient.phone, finalClient.cpf, finalClient.status);
    }
    
    revalidatePath('/(app)/clientes');
    
    // Retorna o cliente que foi efetivamente salvo, com todos os campos.
    const getSavedClient = db.prepare('SELECT * FROM clients WHERE id = ?');
    const savedClient = getSavedClient.get(id) as Client;

    return savedClient;

  } catch (error) {
    console.error('Falha ao salvar cliente:', error);
    throw new Error('Não foi possível salvar o cliente no banco de dados.');
  }
}

/**
 * Exclui um cliente do banco de dados.
 * @param clientId - O ID do cliente a ser excluído.
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
        const stmt = db.prepare('DELETE FROM clients WHERE id = ? AND userId = ?');
        const result = stmt.run(clientId, userId);

        if (result.changes === 0) {
            // Isso pode acontecer se o cliente não existir ou se pertencer a outro usuário.
            throw new Error('Cliente não encontrado ou você não tem permissão para excluí-lo.');
        }

        revalidatePath('/(app)/clientes');

    } catch (error) {
        console.error('Falha ao excluir cliente:', error);
        throw new Error('Não foi possível excluir o cliente do banco de dados.');
    }
}
