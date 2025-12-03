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
import { isToday, isTomorrow, format, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type AgendaWidgetProps = {
  sales: Sale[];
  clientsMap: Record<string, Client>;
};

export function AgendaWidget({ sales, clientsMap }: AgendaWidgetProps) {
  const upcomingTasks = useMemo(() => {
    const today = startOfToday();
    return sales
      .filter((sale) => {
        if (!sale.combinadoDate) return false;
        const combinadoDate = parseISO(sale.combinadoDate as unknown as string);
        return combinadoDate >= today;
      })
      .map((sale) => {
        const combinadoDate = parseISO(sale.combinadoDate as unknown as string);
        const dayLabel = isToday(combinadoDate)
          ? 'Hoje'
          : isTomorrow(combinadoDate)
          ? 'Amanhã'
          : format(combinadoDate, 'dd/MM');
        return {
          ...sale,
          day: dayLabel,
          clientName: clientsMap[sale.clientId]?.name || 'Cliente desconhecido',
          combinadoDate: combinadoDate,
          isToday: isToday(combinadoDate),
          isTomorrow: isTomorrow(combinadoDate),
        };
      })
      .sort((a, b) => a.combinadoDate.getTime() - b.combinadoDate.getTime());
  }, [sales, clientsMap]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <CardTitle>Agenda de Compromissos</CardTitle>
        </div>
        <CardDescription>
          Seus próximos passos agendados com os clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start gap-4">
                 <div className={cn("flex-shrink-0 text-center p-2 w-16 rounded-md font-semibold", 
                    task.isToday ? "bg-red-100 text-red-800" :
                    task.isTomorrow ? "bg-yellow-100 text-yellow-800" :
                    "bg-primary/10 text-primary"
                  )}>
                    <div className="text-xs uppercase">{format(task.combinadoDate, 'MMM', { locale: ptBR })}</div>
                    <div className="text-lg leading-none">{format(task.combinadoDate, 'dd')}</div>
                 </div>
                <div className="grid gap-1 flex-1">
                  <p className={cn("text-sm font-medium leading-tight",
                    task.isToday ? "text-red-600 font-bold" :
                    task.isTomorrow ? "text-yellow-700 font-semibold" :
                    "text-primary"
                  )}>
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
              Nenhum compromisso futuro agendado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
