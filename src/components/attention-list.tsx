import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Sale, Corretor } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';

type AttentionListProps = {
  sales: Sale[];
  corretoresMap: Record<string, Corretor>;
};

export function AttentionList({ sales, corretoresMap }: AttentionListProps) {
  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
             <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <CardTitle>Lista de Atenção (Gargalos)</CardTitle>
        </div>
        <CardDescription>
          Vendas pendentes há mais de 7 dias que precisam de ação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSales.length > 0 ? (
            sortedSales.map((sale) => {
              const daysStopped = differenceInDays(new Date(), new Date(sale.saleDate));
              return(
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
                    {corretoresMap[sale.corretorId]?.name || 'N/A'} - {sale.empreendimento}
                  </p>
                </div>
                <div className="ml-auto text-sm font-semibold text-yellow-600">
                  {daysStopped} dias parado
                </div>
              </div>
            )})
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma pendência crítica. Bom trabalho!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

    