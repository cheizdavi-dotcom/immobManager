'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Users, Phone, List, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NewCorretorDialog } from '@/components/new-corretor-dialog';
import type { Corretor, Sale, User } from '@/lib/types';
import { formatCurrency, safeParseFloat } from '@/lib/utils';
import { SalesHistoryDialog } from '@/components/sales-history-dialog';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useState, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { sales as initialSalesData, corretores as initialCorretoresData } from '@/lib/data';

export default function CorretoresPage() {
  const [user] = useLocalStorage<User | null>('user', null);
  const [allCorretores, setAllCorretores] = useLocalStorage<Corretor[]>('corretores', initialCorretoresData);
  const [allSales] = useLocalStorage<Sale[]>('sales', initialSalesData);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [isNewCorretorDialogOpen, setIsNewCorretorDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedCorretor, setSelectedCorretor] = useState<Corretor | null>(null);
  const { toast } = useToast();

  const corretores = useMemo(() => {
    if (!user) return [];
    return allCorretores.filter(c => c.userId === user.id);
  }, [allCorretores, user]);

  const sales = useMemo(() => {
    if (!user) return [];
    return allSales.filter(s => s.userId === user.id);
  }, [allSales, user]);


  const handleAddOrUpdateCorretor = async (corretorData: Omit<Corretor, 'id' | 'userId'>, id?: string) => {
    if (!user?.id) {
        toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Usuário não autenticado.' });
        return null;
    }
    
    try {
        let savedCorretor: Corretor;
        if (id) {
            savedCorretor = { ...corretorData, id, userId: user.id };
            setAllCorretores(prev => prev.map(c => c.id === id ? savedCorretor : c));
        } else {
            const photoUrl = corretorData.photoUrl || `https://i.pravatar.cc/150?u=${corretorData.name.replace(/\s/g, '')}`;
            savedCorretor = { ...corretorData, photoUrl, id: crypto.randomUUID(), userId: user.id };
            setAllCorretores(prev => [...prev, savedCorretor]);
        }
        
        toast({
            title: id ? 'Corretor Atualizado!' : 'Corretor Cadastrado!',
            description: `${savedCorretor.name} foi salvo com sucesso.`,
        });
        return savedCorretor;
    } catch(err: any) {
        toast({ variant: 'destructive', title: 'Erro ao salvar corretor.', description: err.message });
        return null;
    }
  };

  const handleDeleteCorretor = (corretorId: string) => {
    const corretorHasSales = sales.some(sale => sale.corretorId === corretorId);
    if(corretorHasSales) {
        toast({
            variant: "destructive",
            title: "Ação Bloqueada",
            description: "Não é possível excluir um corretor que já possui vendas registradas.",
        });
        return;
    }

    setAllCorretores((prev) => prev.filter((c) => c.id !== corretorId));
    toast({
        title: 'Corretor Excluído!',
        description: 'O corretor foi removido da sua equipe.',
    });
  };

  const handleEdit = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    setIsNewCorretorDialogOpen(true);
  };

  const handleOpenNewDialog = () => {
    setEditingCorretor(null);
    setIsNewCorretorDialogOpen(true);
  };
  
  const handleOpenHistory = (corretor: Corretor) => {
    setSelectedCorretor(corretor);
    setIsHistoryDialogOpen(true);
  }

  const corretoresComKPIs = useMemo(() => {
    if (!corretores || !sales) return [];
    return corretores.map(corretor => {
      const corretorSales = sales.filter(s => s.corretorId === corretor.id && s.status === 'Venda Concluída / Paga');
      const totalVendido = corretorSales.reduce((acc, sale) => acc + safeParseFloat(sale.saleValue), 0);
      const vendasRealizadas = corretorSales.length;
      return { ...corretor, totalVendido, vendasRealizadas };
    });
  }, [corretores, sales]);

  const renderContent = () => {
     if (!user?.id) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg py-20">
                <Users className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Sessão Inválida</h2>
                <p className="text-muted-foreground">
                    Faça o login novamente para gerenciar seus corretores.
                </p>
           </div>
        )
    }

    if (corretoresComKPIs.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center md:gap-8 md:p-8">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Nenhum corretor cadastrado</h2>
            <p className="text-muted-foreground">
              Clique em 'Novo Corretor' para começar a montar sua equipe.
            </p>
          </div>
        </div>
      );
    }

    return (
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {corretoresComKPIs.map((corretor) => {
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
                    <span className="font-bold">{formatCurrency(corretor.totalVendido)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Vendas Realizadas</span>
                    </div>
                    <span className="font-bold">{corretor.vendasRealizadas}</span>
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
                      <AlertDialogAction onClick={() => handleDeleteCorretor(corretor.id)}>
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
    );
  }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Corretores</h1>
            <p className="text-muted-foreground">Cadastre e gerencie sua equipe de corretores.</p>
        </div>
         <NewCorretorDialog 
            onCorretorSubmit={handleAddOrUpdateCorretor}
            corretor={null}
            isOpen={isNewCorretorDialogOpen && !editingCorretor}
            onOpenChange={(isOpen) => {
              setIsNewCorretorDialogOpen(isOpen);
              if (!isOpen) setEditingCorretor(null);
            }}
        >
          <Button onClick={handleOpenNewDialog} disabled={!user?.id}>Novo Corretor</Button>
        </NewCorretorDialog>
      </div>

      <NewCorretorDialog 
        onCorretorSubmit={handleAddOrUpdateCorretor}
        corretor={editingCorretor}
        isOpen={isNewCorretorDialogOpen && !!editingCorretor}
        onOpenChange={(isOpen) => {
          setIsNewCorretorDialogOpen(isOpen);
          if (!isOpen) setEditingCorretor(null);
        }}
      />

      {renderContent()}

      {selectedCorretor && (
        <SalesHistoryDialog
            isOpen={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            corretor={selectedCorretor}
            sales={sales.filter(s => s.corretorId === selectedCorretor.id)}
        />
      )}
    </main>
  );
}
