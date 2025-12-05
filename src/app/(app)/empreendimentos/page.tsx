'use client';
import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Building, Loader2 } from 'lucide-react';
import { NewDevelopmentDialog } from '@/components/new-development-dialog';
import type { Development, User } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getDevelopments, addOrUpdateDevelopment as addOrUpdateDevelopmentAction, deleteDevelopment as deleteDevelopmentAction } from './actions';

export default function EmpreendimentosPage() {
  const [user] = useLocalStorage<User | null>('user', null);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDevelopment, setEditingDevelopment] = useState<Development | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchDevelopments = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getDevelopments(user.id);
      setDevelopments(data);
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Erro ao buscar empreendimentos.', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);
  
  useEffect(() => {
    fetchDevelopments();
  }, [fetchDevelopments]);


  const handleAddOrUpdateDevelopment = async (devData: Omit<Development, 'id' | 'userId'>, id?: string) => {
    if (!user?.id) {
        toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Usuário não autenticado.' });
        return null;
    }
    
    try {
        const savedDevelopment = await addOrUpdateDevelopmentAction(devData, user.id, id);
        
        await fetchDevelopments();

        toast({
            title: id ? 'Empreendimento Atualizado!' : 'Empreendimento Cadastrado!',
            description: `${savedDevelopment.name} foi salvo com sucesso.`,
        });
        return savedDevelopment;
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao salvar empreendimento.', description: err.message });
        return null;
    }
  };

  const deleteDevelopment = async (developmentId: string) => {
    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Usuário não autenticado.' });
      return;
    }
    // TODO: Add logic to check if development is associated with a sale before deleting
     try {
        await deleteDevelopmentAction(developmentId, user.id);
        setDevelopments((prev) => prev.filter((d) => d.id !== developmentId));
        toast({
            title: 'Empreendimento Excluído!',
            description: 'O empreendimento foi removido da sua lista.',
        });
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao excluir empreendimento.', description: err.message });
    }
  };

  const handleEdit = (development: Development) => {
    setEditingDevelopment(development);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDevelopment(null);
  };

  const handleOpenNewDialog = () => {
    setEditingDevelopment(null);
    setIsDialogOpen(true);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
           <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando empreendimentos...</p>
          </div>
      )
    }

    if (developments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
            <Building className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Nenhum empreendimento cadastrado</h2>
            <p className="text-muted-foreground">
                Clique em 'Novo Empreendimento' para começar.
            </p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-card'>
            <TableHead>Nome</TableHead>
            <TableHead>Construtora</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead className="text-right pr-6">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {developments.map((dev) => (
            <TableRow key={dev.id} className='border-x-0'>
              <TableCell className="font-medium">{dev.name}</TableCell>
              <TableCell>{dev.construtora}</TableCell>
              <TableCell>{dev.localizacao}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(dev)}>
                  <Edit className="h-4 w-4" />
                </Button>
                  <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente o empreendimento.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteDevelopment(dev.id)}>
                          Sim, excluir
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Empreendimentos</h1>
            <p className="text-muted-foreground">Cadastre e gerencie os imóveis disponíveis.</p>
        </div>
        <Button onClick={handleOpenNewDialog} disabled={!user?.id}>Novo Empreendimento</Button>
      </div>
      
      <NewDevelopmentDialog
        development={editingDevelopment}
        onDevelopmentSubmit={handleAddOrUpdateDevelopment}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <Card>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
}
