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
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { cva } from 'class-variance-authority';

type SalesTableProps = {
  sales: Sale[];
};

const statusBadgeVariants = cva('capitalize', {
  variants: {
    status: {
      'Novo Cadastro': 'bg-gray-100 text-gray-800',
      'Em Análise de Crédito': 'bg-yellow-100 text-yellow-800',
      'Aprovado / Aguardando Unidade': 'bg-blue-100 text-blue-800',
      'Assinatura Pendente': 'bg-purple-100 text-purple-800',
      'Venda Concluída / Paga': 'bg-green-100 text-green-800',
      'Venda Caída / Cancelada': 'bg-red-100 text-red-800',
    },
  },
  defaultVariants: {
    status: 'Novo Cadastro',
  },
});


export function SalesTable({ sales }: SalesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Empreendimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <div className="font-medium">{sale.clientName}</div>
                  <div className="text-sm text-muted-foreground md:hidden">{sale.project}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{sale.project}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeVariants({ status: sale.status })}>
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(sale.saleDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sale.saleValue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
