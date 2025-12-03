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
import { cn } from '@/lib/utils';
import {
  ALL_STATUSES,
  ALL_PROJECTS,
  SaleStatus,
  Project,
} from '@/lib/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const saleSchema = z.object({
  saleDate: z.date({ required_error: 'A data da venda é obrigatória.' }),
  agentName: z.string().min(1, 'O nome do corretor é obrigatório.'),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  project: z.enum(ALL_PROJECTS, {
    errorMap: () => ({ message: 'Selecione um empreendimento válido.' }),
  }),
  saleValue: z.preprocess(
    (a) => parseFloat(String(a).replace(/\D/g, '')) / 100,
    z.number().min(0.01, 'O valor da venda deve ser maior que zero.')
  ),
  commission: z.preprocess(
    (a) => parseFloat(String(a).replace(/\D/g, '')) / 100,
    z.number().min(0, 'A comissão não pode ser negativa.')
  ),
  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({ message: 'Selecione um status válido.' }),
  }),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const formatCurrencyForInput = (value: number | undefined | string) => {
    if (value === undefined || value === null || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

export function NewSaleDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      agentName: '',
      clientName: '',
      status: 'Pendente',
    },
  });

  const saleValue = watch('saleValue');

  useEffect(() => {
    if (saleValue > 0) {
      const commissionValue = saleValue * 0.05;
      setValue('commission', commissionValue);
    }
  }, [saleValue, setValue]);


  const onSubmit = (data: SaleFormValues) => {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Venda</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da venda abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saleDate">Data</Label>
               <Controller
                name="saleDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.saleDate && <p className="text-sm text-destructive">{errors.saleDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentName">Corretor</Label>
              <Input id="agentName" {...register('agentName')} />
              {errors.agentName && <p className="text-sm text-destructive">{errors.agentName.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input id="clientName" {...register('clientName')} />
              {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Empreendimento</Label>
             <Controller
              name="project"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
            {errors.project && <p className="text-sm text-destructive">{errors.project.message}</p>}
          </div>


          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="saleValue">Valor da Venda</Label>
              <Controller
                name="saleValue"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="R$ 0,00"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(Number(value) / 100);
                    }}
                    value={formatCurrencyForInput(field.value)}
                  />
                )}
              />
              {errors.saleValue && <p className="text-sm text-destructive">{errors.saleValue.message}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="commission">Comissão (5%)</Label>
              <Controller
                name="commission"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="R$ 0,00"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(Number(value) / 100);
                    }}
                    value={formatCurrencyForInput(field.value)}
                  />
                )}
              />
              {errors.commission && <p className="text-sm text-destructive">{errors.commission.message}</p>}
            </div>
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
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
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit">Salvar Venda</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
