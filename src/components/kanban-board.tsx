import type { Sale, SaleStatus } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { FileText } from 'lucide-react';
import { NewSaleDialog } from './new-sale-dialog';


type KanbanBoardProps = {
  sales: Sale[];
  statuses: SaleStatus[];
};

export function KanbanBoard({ sales, statuses }: KanbanBoardProps) {
    if (sales.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-20">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Nenhuma venda registrada</h2>
          <p className="text-muted-foreground">
            Clique em 'Nova Venda' para começar a adicionar.
          </p>
          <div className='mt-4'>
            <NewSaleDialog />
          </div>
        </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-250px)]">
      {statuses.map((status) => {
        const salesInStatus = sales.filter((sale) => sale.status === status);
        return (
          <KanbanColumn
            key={status}
            title={status}
            sales={salesInStatus}
          />
        );
      })}
    </div>
  );
}
