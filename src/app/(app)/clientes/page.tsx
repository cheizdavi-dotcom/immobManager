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
import { Trash2, Edit, Users, Phone, Loader2 } from 'lucide-react';
import { NewClientDialog } from '@/components/new-client-dialog';
import type { Client, User } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { getClients, addOrUpdateClient, deleteClient as deleteClientAction } from './actions';

const statusBadgeVariants = cva('capitalize font-semibold text-xs border', {
  variants: {
    status: {
      Frio: 'bg-blue-100 text-blue-800 border-blue-200',
      Morno: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Quente: 'bg-orange-100 text-orange-800 border-orange-200',
    },
  },
});

export default function ClientesPage() {
  const [user] = useLocalStorage<User | null>('user', null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getClients(user.id);
      setClients(data);
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Erro ao buscar clientes.', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddOrUpdateClient = async (clientFormData: Omit<Client, 'id' | 'userId'>, id?: string) => {
    if (!user?.id) {
        toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Usuário não autenticado.' });
        return null;
    }
    
    try {
        const savedClient = await addOrUpdateClient(clientFormData, user.id, id);
        
        // Re-fetch a lista para garantir consistência total com o banco de dados.
        await fetchClients();

        toast({
            title: id ? 'Cliente Atualizado!' : 'Cliente Cadastrado!',
            description: `${savedClient.name} foi salvo com sucesso.`,
        });
        return savedClient;
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao salvar cliente.', description: err.message });
        return null;
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user?.id) {
        toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Usuário não autenticado.' });
        return;
    }

    try {
        await deleteClientAction(clientId, user.id);
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        toast({
            title: 'Cliente Excluído!',
            description: 'O cliente foi removido da sua lista.',
        });
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao excluir cliente.', description: err.message });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const handleOpenNewDialog = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  }

  const renderContent = () => {
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
        )
    }

    if (!user?.id) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
                <Users className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Sessão Inválida</h2>
                <p className="text-muted-foreground">
                    Faça o login novamente para gerenciar seus clientes.
                </p>
           </div>
        )
    }

    if (clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
           <Users className="h-16 w-16 text-muted-foreground" />
           <h2 className="text-2xl font-semibold">Nenhum cliente cadastrado</h2>
           <p className="text-muted-foreground">
               Clique em 'Novo Cliente' para começar a montar sua carteira.
           </p>
       </div>
      )
    }

    return (
       <Table>
          <TableHeader>
            <TableRow className='hover:bg-card'>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
                const whatsappLink = `https://wa.me/${(client.phone || '').replace(/\D/g, '')}`;
                return(
              <TableRow key={client.id} className='border-x-0'>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                     <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                    </a>
                </TableCell>
                <TableCell>{client.cpf}</TableCell>
                <TableCell>
                    <Badge className={statusBadgeVariants({ status: client.status})}>{client.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
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
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                            Sim, excluir
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Clientes</h1>
            <p className="text-muted-foreground">Cadastre e gerencie sua carteira de clientes.</p>
        </div>
        <Button onClick={handleOpenNewDialog} disabled={!user?.id}>Novo Cliente</Button>
      </div>

      <NewClientDialog
        client={editingClient}
        onClientSubmit={handleAddOrUpdateClient}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <Card>
        <CardContent className='p-0'>
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
}
