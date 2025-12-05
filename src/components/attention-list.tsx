'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Sale, Corretor, Client, Development } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useMemo } from 'react';

type AttentionListProps = {
  sales: Sale[];
  corretoresMap: Record<string, Corretor>;
  clientsMap: Record<string, Client>;
  developmentsMap: Record<string, Development>;
};

export function AttentionList({ sales, corretoresMap, clientsMap, developmentsMap }: AttentionListProps) {
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
              const saleDate = new Date(sale.saleDate);
              const daysStopped = differenceInDays(new Date(), saleDate);
              const clientName = clientsMap[sale.clientId]?.name || 'N/A';
              const developmentName = developmentsMap[sale.developmentId]?.name || 'N/A';
              return(
              <div key={sale.id} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarFallback>
                    {clientName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {corretoresMap[sale.corretorId]?.name || 'N/A'} - {developmentName}
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
