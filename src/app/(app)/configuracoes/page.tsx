'use client';
import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const DATA_KEYS = ['sales', 'clients', 'corretores', 'developments', 'user'];

export default function SettingsPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleExport = () => {
        setIsExporting(true);
        try {
            const dataToExport: Record<string, any> = {};
            DATA_KEYS.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    dataToExport[key] = JSON.parse(item);
                }
            });

            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'backup_imobiliaria.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
                title: "Exportação Concluída!",
                description: "Seu arquivo 'backup_imobiliaria.json' foi baixado.",
            });

        } catch (error) {
            console.error("Erro ao exportar dados:", error);
            toast({
                variant: "destructive",
                title: "Erro na Exportação",
                description: "Não foi possível gerar o arquivo de backup.",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/json') {
            setPendingFile(file);
            setIsAlertOpen(true);
        } else {
            toast({
                variant: "destructive",
                title: "Arquivo Inválido",
                description: "Por favor, selecione um arquivo .json válido.",
            });
        }
        // Reset file input to allow selecting the same file again
        event.target.value = '';
    };

    const proceedWithImport = () => {
        if (!pendingFile) return;
        
        setIsImporting(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Falha ao ler o arquivo.");
                }
                const data = JSON.parse(text);

                // Apaga os dados atuais
                DATA_KEYS.forEach(key => {
                    localStorage.removeItem(key);
                });

                // Grava os novos dados
                let validKeysFound = 0;
                Object.keys(data).forEach(key => {
                    if (DATA_KEYS.includes(key)) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                        validKeysFound++;
                    }
                });

                if(validKeysFound === 0){
                    throw new Error("O arquivo não contém dados válidos para a aplicação.");
                }

                toast({
                    title: "Importação Concluída!",
                    description: "Seus dados foram carregados. A página será atualizada.",
                });

                // Força o recarregamento
                setTimeout(() => {
                    window.location.reload();
                }, 1500);

            } catch (error: any) {
                console.error("Erro ao importar dados:", error);
                toast({
                    variant: "destructive",
                    title: "Erro na Importação",
                    description: error.message || "Ocorreu um erro ao processar o arquivo.",
                });
                setIsImporting(false);
            }
        };
        
        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "Erro de Leitura",
                description: "Não foi possível ler o arquivo selecionado.",
            });
            setIsImporting(false);
        };

        reader.readAsText(pendingFile);
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">Gerencie a portabilidade dos seus dados.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Download className="h-8 w-8 text-blue-500" />
                        <div>
                            <CardTitle>Levar Dados (Exportar)</CardTitle>
                            <CardDescription>Baixe um arquivo de backup com todos os seus dados para salvá-lo ou transferir para outro dispositivo.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                "Exportar Meus Dados"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Upload className="h-8 w-8 text-orange-500" />
                        <div>
                            <CardTitle>Carregar Dados (Importar)</CardTitle>
                            <CardDescription>Carregue um arquivo de backup para restaurar seus dados. Isso substituirá todos os dados atuais.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleImportClick} variant="outline" disabled={isImporting}>
                             {isImporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                "Importar Arquivo de Backup"
                            )}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileSelected}
                        />
                    </CardContent>
                </Card>
            </div>
            
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-2">
                            Essa ação é irreversível. Todos os dados atualmente salvos neste navegador (vendas, clientes, etc.) serão **substituídos** pelos dados do arquivo que você está carregando.
                            <br/><br/>
                            Use esta função para restaurar um backup ou para trazer dados de outro dispositivo (como do seu computador para o celular).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingFile(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={proceedWithImport}>
                            Sim, substituir dados
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}
