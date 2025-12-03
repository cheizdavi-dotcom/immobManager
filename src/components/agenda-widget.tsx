'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Sale, Client } from '@/lib/types';
import { useMemo } from 'react';
import { isToday, isTomorrow, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck } from 'lucide-react';

type AgendaWidgetProps = {
  sales: Sale[];
  clientsMap: Record<string, Client>;
};

export function AgendaWidget({ sales, clientsMap }: AgendaWidgetProps) {
  const upcomingTasks = useMemo(() => {
    return sales
      .filter((sale) => {
        if (!sale.combinadoDate) return false;
        const combinadoDate = parseISO(sale.combinadoDate as unknown as string);
        return isToday(combinadoDate) || isTomorrow(combinadoDate);
      })
      .map((sale) => {
        const combinadoDate = parseISO(sale.combinadoDate as unknown as string);
        const day = isToday(combinadoDate)
          ? 'Hoje'
          : isTomorrow(combinadoDate)
          ? 'Amanhã'
          : format(combinadoDate, 'dd/MM');
        return {
          ...sale,
          day,
          clientName: sale.clientName || 'Cliente desconhecido',
        };
      })
      .sort((a, b) => new Date(a.combinadoDate as Date).getTime() - new Date(b.combinadoDate as Date).getTime());
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <CardTitle>Agenda de Compromissos</CardTitle>
        </div>
        <CardDescription>
          Seus próximos passos agendados para hoje e amanhã.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4">
                 <div className="flex-shrink-0 bg-primary/10 text-primary font-semibold rounded-md text-center p-2 w-16">
                    <div className="text-xs uppercase">{format(new Date(task.combinadoDate as Date), 'MMM', { locale: ptBR })}</div>
                    <div className="text-lg leading-none">{format(new Date(task.combinadoDate as Date), 'dd')}</div>
                 </div>
                <div className="grid gap-1 flex-1">
                  <p className="text-sm font-medium leading-tight text-primary">
                    {task.day}
                  </p>
                  <p className="font-semibold leading-none">
                    {task.combinado}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {task.clientName}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum compromisso para hoje ou amanhã.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
