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
import { useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

const developmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  construtora: z.string().min(1, 'A construtora é obrigatória.'),
  localizacao: z.string().min(1, 'A localização é obrigatória.'),
});

type DevelopmentFormValues = z.infer<typeof developmentSchema>;

type NewDevelopmentDialogProps = {
  onDevelopmentSubmit: (development: Development) => void;
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
  const { toast } = useToast();
  const isEditing = !!development;

  const {
    register,
    handleSubmit,
    formState: { errors },
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
          id: undefined,
          name: '',
          construtora: '',
          localizacao: '',
        });
      }
    }
  }, [development, isEditing, reset, isOpen]);

  const onSubmit = (data: DevelopmentFormValues) => {
    const finalData: Development = {
      ...data,
      id: development?.id || new Date().toISOString(),
    };
    onDevelopmentSubmit(finalData);
    toast({
      title: isEditing ? 'Empreendimento Atualizado!' : 'Empreendimento Cadastrado!',
      description: `${data.name} foi salvo com sucesso.`,
    });
    if (onOpenChange) onOpenChange(false);
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
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="construtora">Construtora</Label>
            <Input id="construtora" placeholder="Ex: Tenda, MRV" {...register('construtora')} />
            {errors.construtora && <p className="text-sm text-destructive">{errors.construtora.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="localizacao">Localização</Label>
            <Input id="localizacao" placeholder="Ex: Bairro, Cidade" {...register('localizacao')} />
            {errors.localizacao && <p className="text-sm text-destructive">{errors.localizacao.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Empreendimento'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
