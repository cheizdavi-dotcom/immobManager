'use client';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
import { Trash2, Edit, Building } from 'lucide-react';
import { NewDevelopmentDialog } from '@/components/new-development-dialog';
import type { Development } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmpreendimentosPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const developmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'developments');
  }, [firestore, user?.uid]);

  const { data: developments, isLoading } = useCollection<Development>(developmentsQuery);

  const [editingDevelopment, setEditingDevelopment] = useState<Development | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const addOrUpdateDevelopment = (development: Development) => {
    if (!firestore || !user?.uid) return;
    const devRef = doc(firestore, 'users', user.uid, 'developments', development.id);
    setDocumentNonBlocking(devRef, development, { merge: true });
  };

  const deleteDevelopment = (developmentId: string) => {
    if (!firestore || !user?.uid) return;
    // TODO: Add logic to check if development is associated with a sale before deleting
    const devRef = doc(firestore, 'users', user.uid, 'developments', developmentId);
    deleteDocumentNonBlocking(devRef);
    toast({
      title: 'Empreendimento Excluído!',
      description: 'O empreendimento foi removido da sua lista.',
    });
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
        <div className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )
    }

    if (!developments || developments.length === 0) {
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
        <Button onClick={handleOpenNewDialog}>Novo Empreendimento</Button>
      </div>
      
      <NewDevelopmentDialog
        development={editingDevelopment}
        onDevelopmentSubmit={addOrUpdateDevelopment}
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
