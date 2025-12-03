'use client';
import type { Sale } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { cva } from 'class-variance-authority';
import { Edit, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { NewSaleDialog } from './new-sale-dialog';

type SalesTableProps = {
  sales: Sale[];
};

type SortKey = keyof Sale;

const statusBadgeVariants = cva('capitalize font-semibold', {
  variants: {
    status: {
      Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Pago: 'bg-green-100 text-green-800 border-green-200',
      Caiu: 'bg-red-100 text-red-800 border-red-200',
    },
  },
  defaultVariants: {
    status: 'Pendente',
  },
});

export function SalesTable({ sales }: SalesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('saleDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedSales = [...sales].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

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
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('saleDate')}>
                  Data <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Corretor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Empreendimento</TableHead>
              <TableHead className="text-right">Valor Venda</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.saleDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{sale.agentName}</TableCell>
                <TableCell>{sale.clientName}</TableCell>
                <TableCell>{sale.project}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sale.saleValue)}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {formatCurrency(sale.commission)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeVariants({ status: sale.status })}>
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
