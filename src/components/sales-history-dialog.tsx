'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Sale, Corretor, Client, Development } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { cva } from 'class-variance-authority';
import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


type SalesHistoryDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    corretor: Corretor | null;
    sales: Sale[];
}

const statusBadgeVariants = cva('capitalize font-semibold text-xs whitespace-nowrap border', {
  variants: {
    status: {
      'Proposta / Cadastro': 'bg-gray-100 text-gray-800 border-gray-200',
      'Análise de Crédito / SPC': 'bg-orange-100 text-orange-800 border-orange-200',
      'Aguardando Assinatura': 'bg-blue-100 text-blue-800 border-blue-200',
      'Aguardando Pagamento Ato': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Venda Concluída / Paga': 'bg-green-100 text-green-800 border-green-200',
      'Venda Cancelada / Caiu': 'bg-red-100 text-red-800 border-red-200',
    },
  },
});


export function SalesHistoryDialog({ isOpen, onOpenChange, corretor, sales }: SalesHistoryDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();

    const clientsQuery = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return query(collection(firestore, 'clients'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: clientsData } = useCollection<Client>(clientsQuery);

    const developmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'developments'), where('userId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: developmentsData } = useCollection<Development>(developmentsQuery);

    const clientsMap = useMemo(() => {
        if (!clientsData) return {};
        return clientsData.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
        }, {} as Record<string, Client>);
    }, [clientsData]);

    const developmentsMap = useMemo(() => {
        if (!developmentsData) return {};
        return developmentsData.reduce((acc, dev) => {
            acc[dev.id] = dev;
            return acc;
        }, {} as Record<string, Development>);
    }, [developmentsData]);

  if (!corretor) return null;

  const sortedSales = [...sales].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Vendas: {corretor.name}</DialogTitle>
          <DialogDescription>
            Todas as vendas registradas para este corretor.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            {sortedSales.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Empreendimento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>{format(new Date(sale.saleDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{clientsMap[sale.clientId]?.name || 'N/A'}</TableCell>
                                <TableCell>{developmentsMap[sale.developmentId]?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right">{formatCurrency(sale.saleValue)}</TableCell>
                                <TableCell>
                                    <Badge className={statusBadgeVariants({status: sale.status})}>{sale.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            ) : (
                <p className='text-center text-muted-foreground py-8'>Nenhuma venda registrada para este corretor.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
