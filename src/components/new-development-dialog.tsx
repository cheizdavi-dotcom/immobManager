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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Development } from '@/lib/types';
import { useState, useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';


const developmentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  construtora: z.string().min(1, 'A construtora é obrigatória.'),
  localizacao: z.string().min(1, 'A localização é obrigatória.'),
});

type DevelopmentFormValues = z.infer<typeof developmentSchema>;

type NewDevelopmentDialogProps = {
  onDevelopmentSubmit: (development: DevelopmentFormValues, id?:string) => Promise<Development | null>;
  development?: Development | null;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: ReactNode;
};

export function NewDevelopmentDialog({
  onDevelopmentSubmit,
  development = null,
  isOpen,
  onOpenChange,
  children,
}: NewDevelopmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!development;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<DevelopmentFormValues>({
    resolver: zodResolver(developmentSchema),
    defaultValues: {
        name: '',
        construtora: '',
        localizacao: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && development) {
        reset(development);
      } else {
        reset({
          name: '',
          construtora: '',
          localizacao: '',
        });
      }
    }
  }, [development, isEditing, reset, isOpen]);

  const onSubmit = async (data: DevelopmentFormValues) => {
    setIsSubmitting(true);
    const result = await onDevelopmentSubmit(data, development?.id);
    setIsSubmitting(false);
    if(result && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empreendimento' : 'Cadastrar Novo Empreendimento'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os detalhes do empreendimento.' : 'Preencha os detalhes do novo empreendimento.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Empreendimento</Label>
            <Input id="name" {...register('name')} disabled={isSubmitting} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="construtora">Construtora</Label>
            <Input id="construtora" placeholder="Ex: Tenda, MRV" {...register('construtora')} disabled={isSubmitting} />
            {errors.construtora && <p className="text-sm text-destructive">{errors.construtora.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input id="localizacao" placeholder="Ex: Bairro, Cidade" {...register('localizacao')} disabled={isSubmitting} />
            {errors.localizacao && <p className="text-sm text-destructive">{errors.localizacao.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? (isEditing ? 'Salvando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Salvar Empreendimento')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
