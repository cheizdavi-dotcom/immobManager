'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn, formatCurrency } from '@/lib/utils';
import {
  ALL_STATUSES,
  ALL_PROJECTS,
  ALL_BUILDERS,
  SaleStatus,
  Project,
  Builder,
} from '@/lib/types';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const saleSchema = z.object({
  saleDate: z.date({ required_error: 'A data da venda é obrigatória.' }),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  project: z.enum(ALL_PROJECTS, {
    errorMap: () => ({ message: 'Selecione um empreendimento válido.' }),
  }),
  builder: z.enum(ALL_BUILDERS, {
    errorMap: () => ({ message: 'Selecione uma construtora válida.' }),
  }),
  downPayment: z.preprocess(
    (a) => parseFloat(String(a).replace(/[^0-9,]/g, '').replace(',', '.')),
    z.number().min(0, 'O valor do ato não pode ser negativo.')
  ),
  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({ message: 'Selecione um status válido.' }),
  }),
  notes: z.string().optional(),
});

export function NewSaleDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
        clientName: '',
        notes: '',
    }
  });

  const onSubmit = (data: z.infer<typeof saleSchema>) => {
    console.log(data);
    toast({
      title: 'Venda Cadastrada!',
      description: `A venda para ${data.clientName} foi criada com sucesso.`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Venda</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da venda abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saleDate" className="text-right">
              Data
            </Label>
            <Controller
              name="saleDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal col-span-3',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.saleDate && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.saleDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientName" className="text-right">
              Cliente
            </Label>
            <Input id="clientName" {...register('clientName')} className="col-span-3" />
            {errors.clientName && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.clientName.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Empreendimento
            </Label>
            <Controller
              name="project"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_PROJECTS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.project && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.project.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="builder" className="text-right">
              Construtora
            </Label>
             <Controller
              name="builder"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_BUILDERS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.builder && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.builder.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="downPayment" className="text-right">
              Valor do Ato
            </Label>
            <Input id="downPayment" {...register('downPayment')} placeholder="R$ 0,00" className="col-span-3" />
            {errors.downPayment && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.downPayment.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
             <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="col-start-2 col-span-3 text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Observações
            </Label>
            <Textarea id="notes" {...register('notes')} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Venda</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
