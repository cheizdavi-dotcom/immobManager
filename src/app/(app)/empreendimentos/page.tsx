'use client';
import { useState } from 'react';
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
import { Trash2, Edit, Building } from 'lucide-react';
import { NewDevelopmentDialog } from '@/components/new-development-dialog';
import type { Development } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function EmpreendimentosPage() {
  const [developments, setDevelopments] = useLocalStorage<Development[]>('developments', []);
  const [editingDevelopment, setEditingDevelopment] = useState<Development | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const addOrUpdateDevelopment = (development: Development) => {
    setDevelopments((prev) => {
      const existing = prev.find((d) => d.id === development.id);
      if (existing) {
        return prev.map((d) => (d.id === development.id ? development : d));
      }
      return [...prev, development];
    });
  };

  const deleteDevelopment = (developmentId: string) => {
    // TODO: Add logic to check if development is associated with a sale before deleting
    setDevelopments((prev) => prev.filter((d) => d.id !== developmentId));
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
