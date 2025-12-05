'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Users, DollarSign, TrendingUp, Phone, List, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NewCorretorDialog } from '@/components/new-corretor-dialog';
import type { Corretor, Sale } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { SalesHistoryDialog } from '@/components/sales-history-dialog';
import { useState, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from "@/components/ui/skeleton";


export default function CorretoresPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const corretoresQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'corretores'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'sales'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: corretores, isLoading: isLoadingCorretores } = useCollection<Corretor>(corretoresQuery);
  const { data: sales, isLoading: isLoadingSales } = useCollection<Sale>(salesQuery);

  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [isNewCorretorDialogOpen, setIsNewCorretorDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCorretor, setSelectedCorretor] = useState<Corretor | null>(null);
  const { toast } = useToast();

  const addOrUpdateCorretor = (corretor: Corretor) => {
    if (!firestore || !user?.uid) return;
    const corretorRef = doc(firestore, 'corretores', corretor.id);
    const dataToSave = { ...corretor, userId: user.uid };
    setDocumentNonBlocking(corretorRef, dataToSave, { merge: true });
  };

  const deleteCorretor = (corretorId: string) => {
    if (!sales || !firestore || !user?.uid) return;
    const salesFromCorretor = sales.find(s => s.corretorId === corretorId);
    if(salesFromCorretor){
       toast({
        variant: "destructive",
        title: "Ação Bloqueada",
        description: "Não é possível excluir um corretor que já possui vendas registradas.",
      });
      return;
    }
    const corretorRef = doc(firestore, 'corretores', corretorId);
    deleteDocumentNonBlocking(corretorRef);
    toast({
        title: "Corretor Excluído!",
        description: "O corretor foi removido da sua equipe.",
    });
  };

  const handleEdit = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    setIsNewCorretorDialogOpen(true);
  };
  
  const handleOpenHistory = (corretor: Corretor) => {
    setSelectedCorretor(corretor);
    setIsHistoryDialogOpen(true);
  }

  const getCorretorKPIs = (corretorId: string) => {
    if (!sales) return { totalVendido: 0, vendasRealizadas: 0 };
    const corretorSales = sales.filter(s => s.corretorId === corretorId && s.status === 'Venda Concluída / Paga');
    const totalVendido = corretorSales.reduce((acc, sale) => acc + sale.saleValue, 0);
    const vendasRealizadas = corretorSales.length;
    return { totalVendido, vendasRealizadas };
  }

  if (isLoadingCorretores || isLoadingSales) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </main>
    );
  }


  if (!corretores || corretores.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <Users className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Nenhum corretor cadastrado</h2>
          <p className="text-muted-foreground">
            Clique em 'Novo Corretor' para começar a montar sua equipe.
          </p>
          <div className="mt-4">
             <NewCorretorDialog 
                onCorretorSubmit={addOrUpdateCorretor}
                isOpen={isNewCorretorDialogOpen}
                onOpenChange={(isOpen) => {
                  setIsNewCorretorDialogOpen(isOpen);
                  if (!isOpen) setEditingCorretor(null);
                }}
             />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestão de Corretores</h1>
        <NewCorretorDialog 
          onCorretorSubmit={addOrUpdateCorretor}
          corretor={editingCorretor}
          isOpen={isNewCorretorDialogOpen}
          onOpenChange={(isOpen) => {
            setIsNewCorretorDialogOpen(isOpen);
            if (!isOpen) setEditingCorretor(null);
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {corretores.map((corretor) => {
          const { totalVendido, vendasRealizadas } = getCorretorKPIs(corretor.id);
          const whatsappLink = `https://wa.me/${(corretor.phone || '').replace(/\D/g, '')}`;

          return (
            <Card key={corretor.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={corretor.photoUrl || ''} alt={corretor.name} />
                  <AvatarFallback>{corretor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{corretor.name}</CardTitle>
                  <CardDescription>
                     <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-3 w-3" />
                        {corretor.phone}
                    </a>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Vendido</span>
                    </div>
                    <span className="font-bold">{formatCurrency(totalVendido)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Vendas Realizadas</span>
                    </div>
                    <span className="font-bold">{vendasRealizadas}</span>
                 </div>
              </CardContent>
              <div className="flex border-t p-2">
                 <Button variant="ghost" size="sm" className="w-full justify-center gap-2" onClick={() => handleOpenHistory(corretor)}>
                    <List className="h-4 w-4" /> Histórico
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => handleEdit(corretor)}>Editar</Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-center text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o corretor.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCorretor(corretor.id)}>
                        Sim, excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          )
        })}
      </div>
      {selectedCorretor && (
        <SalesHistoryDialog
            isOpen={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            corretor={selectedCorretor}
            sales={sales?.filter(s => s.corretorId === selectedCorretor.id) || []}
        />
      )}
    </main>
  );
}
