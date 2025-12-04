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
import { cn, formatCurrency, parseCurrency } from '@/lib/utils';
import { ALL_STATUSES, type Sale, type Corretor, type Client, type Development } from '@/lib/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { CreatableSelect } from './creatable-select';

const saleSchema = z.object({
  id: z.string().optional(),
  saleDate: z.date({ required_error: 'A data da venda é obrigatória.' }),
  corretorId: z.string().min(1, 'Selecione um corretor.'),
  clientId: z.string().min(1, 'O nome do cliente é obrigatório.'),
  developmentId: z.string().min(1, 'O nome do empreendimento é obrigatório.'),
  construtora: z.string().min(1, 'O nome da construtora é obrigatório.'),
  saleValue: z.number().min(0, 'O valor da venda não pode ser negativo.'),
  atoValue: z.number().min(0, 'O valor do ato não pode ser negativo.'),
  commissionPercentage: z.preprocess(
    (a) => (a === null || a === undefined || a === '' ? null : parseFloat(String(a).replace(/[^0-9.]/g, ''))),
    z.number().min(0, 'A porcentagem não pode ser negativa.').optional().nullable()
  ),
  commission: z.number().min(0, 'A comissão não pode ser negativa.'),
  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({ message: 'Selecione um status válido.' }),
  }),
  commissionStatus: z.enum(['Pendente', 'Pago']).optional(),
  observations: z.string().optional(),
  combinado: z.string().optional(),
  combinadoDate: z.date().optional().nullable(),
});


type SaleFormValues = z.infer<typeof saleSchema>;

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
    clients: Client[];
    setClients: (clients: Client[] | ((c: Client[]) => Client[])) => void;
    developments: Development[];
    setDevelopments: (developments: Development[] | ((d: Development[]) => Development[])) => void;
}

const CurrencyInput = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));

    useEffect(() => {
        setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = parseCurrency(e.target.value);
        onChange(numericValue);
        setDisplayValue(formatCurrency(numericValue));
    };

    const handleBlur = () => {
        setDisplayValue(formatCurrency(value));
    }

    return (
        <Input
            type="text"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
};

export function NewSaleDialog({ onSaleSubmit, sale = null, isOpen: controlledIsOpen, onOpenChange: setControlledIsOpen, corretores, clients, setClients, developments, setDevelopments }: NewSaleDialogProps) {
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
      status: 'Proposta / Cadastro',
      commissionStatus: 'Pendente',
      observations: '',
      combinado: '',
      saleValue: 0,
      atoValue: 0,
      commission: 0,
      commissionPercentage: 5,
      clientId: '',
      developmentId: '',
      construtora: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && sale) {
        reset({
            ...sale,
            saleDate: new Date(sale.saleDate),
            combinadoDate: sale.combinadoDate ? new Date(sale.combinadoDate) : null,
        });
        } else {
        reset({
            id: undefined,
            corretorId: '',
            clientId: '',
            developmentId: '',
            construtora: '',
            status: 'Proposta / Cadastro',
            saleValue: 0,
            atoValue: 0,
            commissionPercentage: 5,
            commission: 0,
            saleDate: new Date(),
            commissionStatus: 'Pendente',
            observations: '',
            combinado: '',
            combinadoDate: null,
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

  const developmentId = watch('developmentId');
  useEffect(() => {
      const selectedDevelopment = developments.find(d => d.id === developmentId);
      if (selectedDevelopment) {
          setValue('construtora', selectedDevelopment.construtora, { shouldValidate: true });
      }
  }, [developmentId, developments, setValue]);


  const onSubmit = (data: SaleFormValues) => {
    const finalData: Sale = {
        ...data,
        id: sale?.id || new Date().toISOString(),
        commissionStatus: isEditing && sale.commissionStatus ? sale.commissionStatus : 'Pendente',
        observations: data.observations || '',
        combinado: data.combinado || '',
        combinadoDate: data.combinadoDate || null,
        clientName: clients.find(c => c.id === data.clientId)?.name || data.clientId,
        empreendimento: developments.find(d => d.id === data.developmentId)?.name || data.developmentId,
    };
    onSaleSubmit(finalData);
    toast({
      title: isEditing ? 'Venda Atualizada!' : 'Venda Cadastrada!',
      description: `A venda foi salva com sucesso.`,
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
          
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
                           {corretores && corretores.length > 0 ? corretores.map((c) => (
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
              <Label htmlFor="clientId">Cliente</Label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                    <CreatableSelect
                        placeholder="Selecione ou digite um novo cliente"
                        options={clients.map(c => ({ value: c.id, label: c.name }))}
                        value={field.value}
                        onChange={(newValue, isNew) => {
                            if (isNew && newValue) {
                                const newClient: Client = { id: new Date().toISOString(), name: newValue, phone: '', status: 'Frio' };
                                setClients(prev => [...prev, newClient]);
                                field.onChange(newClient.id);
                            } else {
                                field.onChange(newValue);
                            }
                        }}
                    />
                )}
                />
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>

           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="developmentId">Empreendimento</Label>
                <Controller
                    name="developmentId"
                    control={control}
                    render={({ field }) => (
                        <CreatableSelect
                            placeholder="Selecione ou digite um novo empreendimento"
                            options={developments.map(d => ({ value: d.id, label: d.name }))}
                            value={field.value}
                            onChange={(newValue, isNew) => {
                                if (isNew && newValue) {
                                    // When creating a new development, we can prompt for construtora or leave it blank
                                    const newDev: Development = { id: new Date().toISOString(), name: newValue, construtora: '', localizacao: '' };
                                    setDevelopments(prev => [...prev, newDev]);
                                    field.onChange(newDev.id);
                                    setValue('construtora', ''); // Reset construtora
                                } else {
                                    field.onChange(newValue);
                                }
                            }}
                        />
                    )}
                />
                {errors.developmentId && <p className="text-sm text-destructive">{errors.developmentId.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="construtora">Construtora</Label>
                <Input id="construtora" {...register('construtora')} placeholder="Ex: Tenda, MRV" readOnly />
                {errors.construtora && <p className="text-sm text-destructive">{errors.construtora.message}</p>}
            </div>
          </div>

           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="saleValue">Valor da Venda</Label>
                <Controller
                    name="saleValue"
                    control={control}
                    render={({ field }) => <CurrencyInput {...field} />}
                />
                {errors.saleValue && <p className="text-sm text-destructive">{errors.saleValue.message}</p>}
                </div>
                 <div className="space-y-2">
                <Label htmlFor="atoValue">Valor do Ato (Entrada)</Label>
                <Controller
                    name="atoValue"
                    control={control}
                    render={({ field }) => <CurrencyInput {...field} />}
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
                    render={({ field }) => <CurrencyInput {...field} />}
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

             <div className="grid grid-cols-2 gap-4 items-start">
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
                    <Label htmlFor="combinadoDate">Data do Combinado</Label>
                    <Controller
                        name="combinadoDate"
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
                     {errors.combinadoDate && <p className="text-sm text-destructive">{errors.combinadoDate.message}</p>}
                 </div>
            </div>
        
          <div className="space-y-2">
            <Label htmlFor="status">Etapa do Funil</Label>
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
