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
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Corretor } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const corretorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  phone: z.string().min(1, 'O telefone é obrigatório.'),
  photoUrl: z.string().url('A URL da foto deve ser válida.').optional().or(z.literal('')),
});

type CorretorFormValues = z.infer<typeof corretorSchema>;

type NewCorretorDialogProps = {
    onCorretorSubmit: (corretor: Corretor) => void;
    corretor?: Corretor | null;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export function NewCorretorDialog({ onCorretorSubmit, corretor = null, isOpen: controlledIsOpen, onOpenChange: setControlledIsOpen }: NewCorretorDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const { toast } = useToast();

  const isOpen = controlledIsOpen ?? uncontrolledOpen;
  const onOpenChange = setControlledIsOpen ?? setUncontrolledOpen;
  
  const isEditing = !!corretor;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CorretorFormValues>({
    resolver: zodResolver(corretorSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && corretor) {
        reset(corretor);
      } else {
        reset({
          id: undefined,
          name: '',
          phone: '',
          photoUrl: '',
        });
      }
    }
  }, [corretor, isEditing, reset, isOpen]);

  const onSubmit = (data: CorretorFormValues) => {
    const finalData: Corretor = {
        ...data,
        id: corretor?.id || new Date().toISOString(),
    };
    onCorretorSubmit(finalData);
    toast({
      title: isEditing ? 'Corretor Atualizado!' : 'Corretor Cadastrado!',
      description: `${data.name} foi salvo com sucesso.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {!isEditing && (
         <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2" />
                Novo Corretor
            </Button>
         </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Corretor' : 'Cadastrar Novo Corretor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os detalhes do corretor abaixo.' : 'Preencha os detalhes do novo corretor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com DDD)</Label>
              <Input id="phone" placeholder="(XX) XXXXX-XXXX" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
              <Label htmlFor="photoUrl">URL da Foto (Opcional)</Label>
              <Input id="photoUrl" placeholder="https://..." {...register('photoUrl')} />
              {errors.photoUrl && <p className="text-sm text-destructive">{errors.photoUrl.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Corretor'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
