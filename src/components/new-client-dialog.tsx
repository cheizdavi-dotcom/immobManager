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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Client, ALL_CLIENT_STATUSES } from '@/lib/types';
import { useState, useEffect, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório.'),
  phone: z.string().min(1, 'O telefone é obrigatório.'),
  cpf: z.string().optional(),
  status: z.enum(ALL_CLIENT_STATUSES),
});

type ClientFormValues = z.infer<typeof clientSchema>;

type NewClientDialogProps = {
  onClientSubmit: (client: Client) => void;
  client?: Client | null;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: ReactNode;
};

export function NewClientDialog({
  onClientSubmit,
  client = null,
  isOpen,
  onOpenChange,
  children
}: NewClientDialogProps) {
  const { toast } = useToast();
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      cpf: '',
      status: 'Frio',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && client) {
        reset(client);
      } else {
        reset({
          id: undefined,
          name: '',
          phone: '',
          cpf: '',
          status: 'Frio',
        });
      }
    }
  }, [client, isEditing, reset, isOpen]);

  const onSubmit = (data: ClientFormValues) => {
    const finalData: Client = {
      ...data,
      id: client?.id || new Date().toISOString(),
      userId: 'local-user', // Placeholder for local development
    };
    onClientSubmit(finalData);
    toast({
      title: isEditing ? 'Cliente Atualizado!' : 'Cliente Cadastrado!',
      description: `${data.name} foi salvo com sucesso.`,
    });
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os detalhes do cliente.' : 'Preencha os detalhes do novo cliente.'}
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
            <Label htmlFor="cpf">CPF (opcional)</Label>
            <Input id="cpf" {...register('cpf')} />
            {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLIENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
