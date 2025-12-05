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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Corretor } from '@/lib/types';
import { useState, useEffect, useRef, ReactNode } from 'react';

const corretorSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  phone: z.string().min(1, 'O telefone é obrigatório.'),
  photoUrl: z.string().optional().or(z.literal('')),
});

type CorretorFormValues = z.infer<typeof corretorSchema>;

type NewCorretorDialogProps = {
    onCorretorSubmit: (corretor: CorretorFormValues, id?:string) => Promise<Corretor | null>;
    corretor?: Corretor | null;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    children?: ReactNode;
}

export function NewCorretorDialog({ onCorretorSubmit, corretor = null, isOpen, onOpenChange, children }: NewCorretorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!corretor;
  const fileInputRef = useRef<HTMLInputElement>(null);


  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch
  } = useForm<CorretorFormValues>({
    resolver: zodResolver(corretorSchema),
  });

  const photoUrl = watch('photoUrl');

  useEffect(() => {
    if (isOpen) {
      if (isEditing && corretor) {
        reset({
            name: corretor.name,
            phone: corretor.phone,
            photoUrl: corretor.photoUrl || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          photoUrl: '',
        });
      }
    }
  }, [corretor, isEditing, reset, isOpen]);


  const onSubmit = async (data: CorretorFormValues) => {
    setIsSubmitting(true);
    const result = await onCorretorSubmit(data, corretor?.id);
    setIsSubmitting(false);
    if(result && onOpenChange) {
        onOpenChange(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setValue('photoUrl', reader.result as string, { shouldDirty: true });
        };
        reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Corretor' : 'Cadastrar Novo Corretor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os detalhes do corretor abaixo.' : 'Preencha os detalhes do novo corretor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          
          <div className="flex flex-col items-center gap-4">
            <button type="button" onClick={handleAvatarClick} className="relative group rounded-full">
                <Avatar className="h-24 w-24">
                <AvatarImage src={photoUrl || ''} alt="Preview do corretor" />
                <AvatarFallback className="bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                </div>
            </button>
             <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...register('name')} disabled={isSubmitting} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com DDD)</Label>
              <Input id="phone" placeholder="(XX) XXXXX-XXXX" {...register('phone')} disabled={isSubmitting}/>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? (isEditing ? 'Salvando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Corretor')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
