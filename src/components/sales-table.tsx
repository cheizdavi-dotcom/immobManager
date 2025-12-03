'use client';
import type { Sale, Corretor } from '@/lib/types';
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
import { Edit, Trash2, FileText, ArrowUpDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { NewSaleDialog } from './new-sale-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SalesTableProps = {
  sales: Sale[];
  onSaleSubmit: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
  corretores: Corretor[];
  corretoresMap: Record<string, Corretor>;
};

type SortKey = keyof Sale | 'corretorName';

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

export function SalesTable({ sales, onSaleSubmit, onDeleteSale, corretores, corretoresMap }: SalesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('saleDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsDialogOpen(true);
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSale(null);
  }


  const sortedSales = [...sales].sort((a, b) => {
    let aValue, bValue;

    if (sortKey === 'corretorName') {
      aValue = corretoresMap[a.corretorId]?.name || '';
      bValue = corretoresMap[b.corretorId]?.name || '';
    } else {
      aValue = a[sortKey as keyof Sale];
      bValue = b[sortKey as keyof Sale];
    }
    
    if (sortKey === 'saleDate') {
        const aDate = new Date(aValue as string | number | Date).getTime();
        const bDate = new Date(bValue as string | number | Date).getTime();
        if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    }

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
          <h2 className="text-2xl font-semibold">Nenhuma venda encontrada</h2>
          <p className="text-muted-foreground">
            Ajuste os filtros ou clique em 'Nova Venda' para adicionar uma.
          </p>
          <div className='mt-4'>
            <NewSaleDialog onSaleSubmit={onSaleSubmit} corretores={corretores}/>
          </div>
        </div>
    );
  }


  return (
    <TooltipProvider>
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
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('corretorName')}>
                    Corretor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Empreendimento</TableHead>
              <TableHead>Construtora</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('saleValue')}>
                    Valor Venda <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
               <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('atoValue')}>
                    Ato <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
                </TableHead>
              <TableHead className="text-right">
                 <Button variant="ghost" onClick={() => handleSort('commission')}>
                    Comissão <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
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
                <TableCell>{corretoresMap[sale.corretorId]?.name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{sale.clientName}</span>
                    {sale.observations && (
                       <Tooltip>
                        <TooltipTrigger>
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{sale.observations}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{sale.empreendimento}</TableCell>
                <TableCell>{sale.construtora}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sale.saleValue)}
                </TableCell>
                 <TableCell className="text-right">
                  {formatCurrency(sale.atoValue)}
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
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEdit(sale)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDeleteSale(sale.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    {editingSale && (
        <NewSaleDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogClose}
            sale={editingSale}
            onSaleSubmit={onSaleSubmit}
            corretores={corretores}
        />
    )}
    </TooltipProvider>
  );
}
