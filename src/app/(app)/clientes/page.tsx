'use client';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
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
import { Trash2, Edit, Users, Phone } from 'lucide-react';
import { NewClientDialog } from '@/components/new-client-dialog';
import type { Client } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { user } = useUser();
  const firestore = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    console.log('Tentando buscar dados para user:', user?.uid);
    return query(collection(firestore, 'clients'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: clients, isLoading } = useCollection<Client>(clientsQuery);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const addOrUpdateClient = (client: Client) => {
    if (!firestore || !user?.uid) return;
    const clientRef = doc(firestore, 'clients', client.id);
    const dataToSave = { ...client, userId: user.uid };
    setDocumentNonBlocking(clientRef, dataToSave, { merge: true });
  };

  const deleteClient = (clientId: string) => {
    if (!firestore) return;
    // TODO: Add logic to check if client is associated with a sale before deleting
    const clientRef = doc(firestore, 'clients', clientId);
    deleteDocumentNonBlocking(clientRef);
    toast({
      title: 'Cliente Excluído!',
      description: 'O cliente foi removido da sua lista.',
    });
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
        <div className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )
    }

    if (!clients || clients.length === 0) {
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
                        <AlertDialogAction onClick={() => deleteClient(client.id)}>
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
        <Button onClick={handleOpenNewDialog}>Novo Cliente</Button>
      </div>

      <NewClientDialog
        client={editingClient}
        onClientSubmit={addOrUpdateClient}
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
