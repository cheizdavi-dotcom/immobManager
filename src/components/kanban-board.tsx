import type { Sale, SaleStatus } from '@/lib/types';
import { KanbanColumn } from './kanban-column';

type KanbanBoardProps = {
  sales: Sale[];
  statuses: SaleStatus[];
};

export function KanbanBoard({ sales, statuses }: KanbanBoardProps) {
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
