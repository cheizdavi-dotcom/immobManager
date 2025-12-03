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
import { ALL_STATUSES, type Sale, type SaleStatus, type Corretor, CommissionStatus } from '@/lib/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const saleSchema = z.object({
  id: z.string().optional(),
  saleDate: z.date({ required_error: 'A data da venda é obrigatória.' }),
  corretorId: z.string().min(1, 'Selecione um corretor.'),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  empreendimento: z.string().min(1, 'O nome do empreendimento é obrigatório.'),
  construtora: z.string().min(1, 'O nome da construtora é obrigatório.'),
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
  commissionStatus: z.enum(['Pendente', 'Pago']).optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const formatCurrencyForInput = (value: number | undefined | string) => {
    if (value === undefined || value === null || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

type NewSaleDialogProps = {
    onSaleSubmit: (sale: Sale) => void;
    sale?: Sale | null;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    corretores: Corretor[];
}

export function NewSaleDialog({ onSaleSubmit, sale = null, isOpen: controlledIsOpen, onOpenChange: setControlledIsOpen, corretores }: NewSaleDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledOpen;
  const onOpenChange = setControlledIsOpen ?? setUncontrolledOpen;
  
  const isEditing = !!sale;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clientName: '',
      empreendimento: '',
      construtora: '',
      status: 'Pendente',
      commissionStatus: 'Pendente',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && sale) {
        reset({
            ...sale,
            saleDate: new Date(sale.saleDate),
        });
        } else {
        reset({
            id: undefined,
            corretorId: '',
            clientName: '',
            empreendimento: '',
            construtora: '',
            status: 'Pendente',
            saleValue: 0,
            commission: 0,
            saleDate: new Date(),
            commissionStatus: 'Pendente',
        });
        }
    }
  }, [sale, isEditing, reset, isOpen]);

  const saleValue = watch('saleValue');

  useEffect(() => {
    // Only suggest commission if the field hasn't been manually edited.
    if (saleValue > 0 && !dirtyFields.commission) {
      const commissionValue = saleValue * 0.05;
      setValue('commission', commissionValue);
    } else if (saleValue <= 0 && !dirtyFields.commission) {
      setValue('commission', 0);
    }
  }, [saleValue, setValue, dirtyFields.commission]);


  const onSubmit = (data: SaleFormValues) => {
    const finalData: Sale = {
        ...data,
        id: sale?.id || new Date().toISOString(),
        commissionStatus: isEditing ? sale.commissionStatus : 'Pendente'
    };
    onSaleSubmit(finalData);
    toast({
      title: isEditing ? 'Venda Atualizada!' : 'Venda Cadastrada!',
      description: `A venda para ${data.clientName} foi salva com sucesso.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {!isEditing && (
         <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2" />
                Nova Venda
            </Button>
         </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Venda' : 'Cadastrar Nova Venda'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os detalhes da venda abaixo.' : 'Preencha os detalhes da venda abaixo.'}
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
              <Label htmlFor="corretorId">Corretor</Label>
              <Controller
                name="corretorId"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                           {corretores.length > 0 ? corretores.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            )) : <SelectItem value="none" disabled>Nenhum corretor cadastrado</SelectItem>}
                        </SelectContent>
                    </Select>
                )}
              />
              {errors.corretorId && <p className="text-sm text-destructive">{errors.corretorId.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
              <Label htmlFor="clientName">Cliente</Label>
              <Input id="clientName" {...register('clientName')} />
              {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
          </div>

           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="empreendimento">Empreendimento</Label>
                <Input id="empreendimento" {...register('empreendimento')} />
                {errors.empreendimento && <p className="text-sm text-destructive">{errors.empreendimento.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="construtora">Construtora</Label>
                <Input id="construtora" {...register('construtora')} />
                {errors.construtora && <p className="text-sm text-destructive">{errors.construtora.message}</p>}
            </div>
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
              <Label htmlFor="commission">Valor da Comissão (R$)</Label>
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
            <Label htmlFor="status">Status da Venda</Label>
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
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Venda'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
