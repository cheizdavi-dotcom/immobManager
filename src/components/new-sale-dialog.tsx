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
import { CalendarIcon, PlusCircle, Percent } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { ALL_STATUSES, type Sale, type Corretor } from '@/lib/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

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
   atoValue: z.preprocess(
    (a) => parseFloat(String(a).replace(/\D/g, '')) / 100,
    z.number().min(0, 'O valor do ato não pode ser negativo.')
  ),
  commissionPercentage: z.preprocess(
    (a) => parseFloat(String(a).replace(/[^0-9.]/g, '')),
    z.number().min(0, 'A porcentagem não pode ser negativa.').optional().nullable()
  ),
  commission: z.preprocess(
    (a) => parseFloat(String(a).replace(/\D/g, '')) / 100,
    z.number().min(0, 'A comissão não pode ser negativa.')
  ),
  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({ message: 'Selecione um status válido.' }),
  }),
  commissionStatus: z.enum(['Pendente', 'Pago']).optional(),
  observations: z.string().optional(),
  combinado: z.string().optional(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

const formatCurrencyForInput = (value: number | undefined | string) => {
    if (value === undefined || value === null || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatPercentageForInput = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '';
    return String(value);
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
      observations: '',
      combinado: '',
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
            atoValue: 0,
            commissionPercentage: 5,
            commission: 0,
            saleDate: new Date(),
            commissionStatus: 'Pendente',
            observations: '',
            combinado: '',
        });
        }
    }
  }, [sale, isEditing, reset, isOpen]);

  const saleValue = watch('saleValue');
  const commissionPercentage = watch('commissionPercentage');


  useEffect(() => {
    const isCommissionManuallyEdited = dirtyFields.commission;
    if (!isCommissionManuallyEdited && saleValue > 0 && commissionPercentage && commissionPercentage > 0) {
      const commissionValue = saleValue * (commissionPercentage / 100);
      setValue('commission', commissionValue);
    }
  }, [saleValue, commissionPercentage, setValue, dirtyFields.commission]);


  const onSubmit = (data: SaleFormValues) => {
    const finalData: Sale = {
        ...data,
        commissionPercentage: data.commissionPercentage ?? 0,
        id: sale?.id || new Date().toISOString(),
        commissionStatus: isEditing && sale.commissionStatus ? sale.commissionStatus : 'Pendente',
        observations: data.observations || '',
        combinado: data.combinado || '',
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
      <DialogContent className="sm:max-w-lg">
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
                <Label htmlFor="atoValue">Valor do Ato (Entrada)</Label>
                <Controller
                    name="atoValue"
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
                {errors.atoValue && <p className="text-sm text-destructive">{errors.atoValue.message}</p>}
                </div>
           </div>


          <div className="grid grid-cols-[1fr_100px] gap-4 items-end">
             <div className="space-y-2">
              <Label htmlFor="commission">Valor da Comissão (R$)</Label>
              <Controller
                name="commission"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="R$ 0,00"
                    className="bg-muted/50 font-semibold"
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

             <div className="space-y-2">
              <Label htmlFor="commissionPercentage">Comissão (%)</Label>
              <div className="relative">
                <Controller
                  name="commissionPercentage"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="5"
                      className="pl-2 pr-6"
                      onChange={(e) => {
                         const value = e.target.value.replace(/[^0-9.]/g, '');
                         field.onChange(value === '' ? null : parseFloat(value));
                      }}
                      value={formatPercentageForInput(field.value)}
                    />
                  )}
                />
                <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.commissionPercentage && <p className="text-sm text-destructive">{errors.commissionPercentage.message}</p>}
            </div>
          </div>

           <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                {...register('observations')}
                placeholder="Ex: Cliente regularizando SPC, aguardando esposa assinar..."
                rows={2}
              />
              {errors.observations && <p className="text-sm text-destructive">{errors.observations.message}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="combinado">Combinado / Próximo Passo</Label>
              <Textarea
                id="combinado"
                {...register('combinado')}
                placeholder="Ex: Entrevista dia 15; Devolver contrato assinado..."
                rows={2}
              />
              {errors.combinado && <p className="text-sm text-destructive">{errors.combinado.message}</p>}
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
