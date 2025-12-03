import type { Sale, Corretor } from '@/lib/types';
import { KanbanCard } from './kanban-card';

type KanbanColumnProps = {
  title: string;
  sales: Sale[];
  corretoresMap: Record<string, Corretor>;
};

export function KanbanColumn({ title, sales, corretoresMap }: KanbanColumnProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {sales.length}
        </span>
      </div>
      <div className="space-y-4">
        {sales.map((sale) => (
          <KanbanCard 
            key={sale.id} 
            sale={sale} 
            corretorName={corretoresMap[sale.corretorId]?.name || 'N/A'}
          />
        ))}
         {sales.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">Nenhuma venda aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
