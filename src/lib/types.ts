export type SaleStatus =
  | 'Novo Cadastro'
  | 'Em Análise de Crédito'
  | 'Aprovado / Aguardando Unidade'
  | 'Assinatura Pendente'
  | 'Venda Concluída / Paga'
  | 'Venda Caída / Cancelada';

export const ALL_STATUSES: SaleStatus[] = [
  'Novo Cadastro',
  'Em Análise de Crédito',
  'Aprovado / Aguardando Unidade',
  'Assinatura Pendente',
  'Venda Concluída / Paga',
  'Venda Caída / Cancelada',
];

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
  clientName: string;
  project: Project;
  builder: Builder;
  saleValue: number;
  downPayment: number;
  status: SaleStatus;
  saleDate: string;
  lastStatusUpdate: string;
  agentName: string;
  notes?: string;
};
