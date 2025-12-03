import type { Sale, SaleStatus, Corretor, Client, Development } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { FileText } from 'lucide-react';
import { NewSaleDialog } from './new-sale-dialog';


type KanbanBoardProps = {
  sales: Sale[];
  statuses: SaleStatus[];
  onSaleSubmit: (sale: Sale) => void;
  corretoresMap: Record<string, Corretor>;
  clientsMap: Record<string, Client>;
  developmentsMap: Record<string, Development>;
  corretores: Corretor[];
  clients: Client[];
  setClients: (clients: Client[]) => void;
  developments: Development[];
  setDevelopments: (developments: Development[]) => void;
};

export function KanbanBoard({ sales, statuses, onSaleSubmit, corretoresMap, clientsMap, developmentsMap, corretores, clients, setClients, developments, setDevelopments }: KanbanBoardProps) {

    if (sales.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Nenhuma venda encontrada</h2>
          <p className="text-muted-foreground">
            Ajuste os filtros ou clique em 'Nova Venda' para adicionar uma.
          </p>
          <div className='mt-4'>
            <NewSaleDialog onSaleSubmit={onSaleSubmit} corretores={corretores} clients={clients} setClients={setClients} developments={developments} setDevelopments={setDevelopments} />
          </div>
        </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-250px)] overflow-x-auto pb-4">
      {statuses.map((status) => {
        const salesInStatus = sales.filter((sale) => sale.status === status);
        return (
          <KanbanColumn
            key={status}
            title={status}
            sales={salesInStatus}
            corretoresMap={corretoresMap}
            clientsMap={clientsMap}
            developmentsMap={developmentsMap}
          />
        );
      })}
    </div>
  );
}
