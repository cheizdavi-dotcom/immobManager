import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Sale } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type AttentionListProps = {
  sales: Sale[];
};

export function AttentionList({ sales }: AttentionListProps) {
  // The logic for sorting is removed as lastStatusUpdate is no longer in the model
  const sortedSales = [...sales];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendentes</CardTitle>
        <CardDescription>
          Vendas que ainda não foram concluídas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSales.length > 0 ? (
            sortedSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarFallback>
                    {sale.clientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.project}
                  </p>
                </div>
                <div className="ml-auto font-medium text-sm">
                  {formatDistanceToNow(new Date(sale.saleDate), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma pendência. Bom trabalho!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
