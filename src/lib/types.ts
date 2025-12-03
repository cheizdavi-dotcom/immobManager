export type SaleStatus = 'Pendente' | 'Pago' | 'Caiu';

export const ALL_STATUSES: SaleStatus[] = ['Pendente', 'Pago', 'Caiu'];

export type Builder = 'Tenda' | 'Vasco' | 'MRV' | 'Outra';
export const ALL_BUILDERS: Builder[] = ['Tenda', 'Vasco', 'MRV', 'Outra'];

export type Project =
  | 'Morada Serena'
  | 'Solar dos Pássaros'
  | 'Parque do Mirante'
  | 'Solar do Bosque'
  | 'Residencial Flores'
  | 'Villa das Águas';
export const ALL_PROJECTS: Project[] = [
  'Morada Serena',
  'Solar dos Pássaros',
  'Parque do Mirante',
  'Solar do Bosque',
  'Residencial Flores',
  'Villa das Águas',
];

export type Sale = {
  id: string;
  saleDate: Date;
  agentName: string;
  clientName: string;
  project: Project;
  saleValue: number;
  commission: number;
  status: SaleStatus;
};
