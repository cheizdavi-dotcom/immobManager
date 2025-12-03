import type { Sale, Corretor, Client, Development } from '@/lib/types';

export const sales: Sale[] = [];
export const corretores: Corretor[] = [];
export const clients: Client[] = [];
export const developments: Development[] = [];

// Helper functions to generate localStorage keys based on the current user
export const getSalesStorageKey = (userEmail: string) => `sales_${userEmail}`;
export const getClientsStorageKey = (userEmail: string) => `clients_${userEmail}`;
export const getCorretoresStorageKey = (userEmail: string) => `corretores_${userEmail}`;
export const getDevelopmentsStorageKey = (userEmail: string) => `developments_${userEmail}`;
