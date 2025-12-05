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
import { CalendarIcon, PlusCircle, Percent, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn, formatCurrency, parseCurrency, safeParseFloat } from '@/lib/utils';
import { ALL_STATUSES, type Sale, type Corretor, type Client, type Development } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { CreatableSelect } from './creatable-select';

const saleSchema = z.object({
  saleDate: z.date({ required_error: 'A data da venda é obrigatória.' }),
  corretorId: z.string().min(1, 'Selecione um corretor.'),
  clientId: z.string().min(1, 'O nome do cliente é obrigatório.'),
  developmentId: z.string().min(1, 'O nome do empreendimento é obrigatório.'),
  construtora: z.string().optional(), // Now optional as it's derived
  saleValue: z.string().refine((val) => safeParseFloat(val) > 0, { message: 'O valor da venda deve ser maior que zero.' }),
  atoValue: z.string(),
  commissionPercentage: z.string().optional().nullable(),
  commission: z.string(),
  status: z.enum(ALL_STATUSES, {
    errorMap: () => ({ message: 'Selecione um status válido.' }),
  }),
  observations: z.string().optional(),
  combinado: z.string().optional(),
  combinadoDate: z.date().optional().nullable(),
});

type SaleFormValues = z.infer<typeof saleSchema>;

type NewSaleDialogProps = {
    onSaleSubmit: (sale: Omit<Sale, 'id' | 'userId' | 'commissionStatus'>, id?:string) => Promise<Sale | null>;
    sale?: Sale | null;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    corretores: Corretor[];
    clients: Client[];
    onClientSubmit: (client: Omit<Client, 'id' | 'userId'>) => Promise<Client | null>;
    developments: Development[];
    onDevelopmentSubmit: (dev: Omit<Development, 'id' | 'userId'>) => Promise<Development | null>;
}

const CurrencyInput = ({ value, onChange, ...props }: { value: string, onChange: (value: string) => void } & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(formatCurrency(safeParseFloat(value)));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = parseCurrency(inputValue);
        setDisplayValue(inputValue);
        onChange(String(numericValue)); // Store raw numeric string internally
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const numericValue = parseCurrency(e.target.value);
      setDisplayValue(formatCurrency(numericValue));
    }

    return (
        <Input
            type="text"
            inputMode="decimal"
            placeholder="R$ 0,00"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
        />
    );
};

export function NewSaleDialog({ onSaleSubmit, sale = null, isOpen: controlledIsOpen, onOpenChange: setControlledIsOpen, corretores, clients, onClientSubmit, developments, onDevelopmentSubmit }: NewSaleDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = controlledIsOpen ?? uncontrolledOpen;
  const onOpenChange = setControlledIsOpen ?? setUncontrolledOpen;
  
  const isEditing = !!sale;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields, isDirty },
    reset,
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      status: 'Proposta / Cadastro',
      observations: '',
      combinado: '',
      saleValue: '0',
      atoValue: '0',
      commission: '0',
      commissionPercentage: '5',
      clientId: '',
      developmentId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (isEditing && sale) {
            reset({
                ...sale,
                saleDate: parseISO(sale.saleDate),
                combinadoDate: sale.combinadoDate ? parseISO(sale.combinadoDate) : null,
                saleValue: String(sale.saleValue),
                atoValue: String(sale.atoValue),
                commission: String(sale.commission),
                commissionPercentage: sale.commissionPercentage?.toString() || '0',
            });
        } else {
            reset({
                corretorId: '',
                clientId: '',
                developmentId: '',
                status: 'Proposta / Cadastro',
                saleValue: '0',
                atoValue: '0',
                commissionPercentage: '5',
                commission: '0',
                saleDate: new Date(),
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
    if (!dirtyFields.commission) {
      const saleVal = safeParseFloat(saleValue);
      const commissionPerc = safeParseFloat(commissionPercentage);

      if (saleVal > 0 && commissionPerc > 0) {
        const commissionValue = saleVal * (commissionPerc / 100);
        setValue('commission', String(commissionValue), { shouldDirty: false });
      }
    }
  }, [saleValue, commissionPercentage, setValue, dirtyFields.commission]);


  const developmentId = watch('developmentId');
  useEffect(() => {
      const selectedDevelopment = developments.find(d => d.id === developmentId);
      if (selectedDevelopment) {
          setValue('construtora', selectedDevelopment.construtora, { shouldValidate: true });
      }
  }, [developmentId, developments, setValue]);


  const onSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true);
    const selectedDevelopment = developments.find(d => d.id === data.developmentId);
    
    const submissionData = {
        ...data,
        saleDate: data.saleDate.toISOString(),
        combinadoDate: data.combinadoDate ? data.combinadoDate.toISOString() : null,
        saleValue: safeParseFloat(data.saleValue),
        atoValue: safeParseFloat(data.atoValue),
        commission: safeParseFloat(data.commission),
        commissionPercentage: data.commissionPercentage ? safeParseFloat(data.commissionPercentage) : null,
        construtora: selectedDevelopment?.construtora || ''
    };
    const result = await onSaleSubmit(submissionData, sale?.id);
    setIsSubmitting(false);
    if (result && onOpenChange) {
        onOpenChange(false);
    }
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
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
                        onChange={async (newValue, isNew) => {
                            if (isNew && newValue) {
                                const newClientData = { name: newValue, phone: '', status: 'Frio' as const };
                                const createdClient = await onClientSubmit(newClientData);
                                if (createdClient) {
                                    field.onChange(createdClient.id);
                                }
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
                            placeholder="Selecione ou crie um novo"
                            options={developments.map(d => ({ value: d.id, label: d.name }))}
                            value={field.value}
                            onChange={async (newValue, isNew) => {
                                if (isNew && newValue) {
                                    const newDevData = { name: newValue, construtora: '', localizacao: '' };
                                    const createdDev = await onDevelopmentSubmit(newDevData);
                                    if(createdDev) {
                                        field.onChange(createdDev.id);
                                        setValue('construtora', createdDev.construtora, { shouldValidate: true });
                                    }
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
                <Input id="construtora" {...register('construtora')} placeholder="Ex: Tenda, MRV" readOnly disabled={isSubmitting}/>
            </div>
          </div>

           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="saleValue">Valor da Venda</Label>
                <Controller
                    name="saleValue"
                    control={control}
                    render={({ field }) => <CurrencyInput {...field} disabled={isSubmitting} />}
                />
                {errors.saleValue && <p className="text-sm text-destructive">{errors.saleValue.message}</p>}
                </div>
                 <div className="space-y-2">
                <Label htmlFor="atoValue">Valor do Ato (Entrada)</Label>
                <Controller
                    name="atoValue"
                    control={control}
                    render={({ field }) => <CurrencyInput {...field} disabled={isSubmitting} />}
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
                    render={({ field }) => <CurrencyInput {...field} disabled={isSubmitting} />}
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
                      inputMode="decimal"
                      placeholder="5"
                      className="pl-2 pr-6"
                      onChange={(e) => {
                         const value = e.target.value.replace(/[^0-9.]/g, '');
                         field.onChange(value);
                      }}
                      value={field.value || ''}
                      disabled={isSubmitting}
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
                 disabled={isSubmitting}
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
                     disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isSubmitting}>
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
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
