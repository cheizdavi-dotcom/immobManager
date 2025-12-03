import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/kanban-board';
import { SalesTable } from '@/components/sales-table';
import { NewSaleDialog } from '@/components/new-sale-dialog';
import { sales } from '@/lib/data';
import { ALL_STATUSES } from '@/lib/types';

export default function VendasPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center justify-between p-4 md:p-6 border-b">
        <h2 className="text-2xl font-semibold">Pipeline de Vendas</h2>
        <NewSaleDialog />
      </div>
      <div className="flex-1">
        <Tabs defaultValue="board" className="h-full flex flex-col">
          <div className="p-4 md:p-6">
            <TabsList>
              <TabsTrigger value="board">Quadro</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="board" className="flex-1 overflow-x-auto p-4 md:p-6 pt-0">
            <KanbanBoard sales={sales} statuses={ALL_STATUSES} />
          </TabsContent>
          <TabsContent value="list" className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
            <SalesTable sales={sales} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
