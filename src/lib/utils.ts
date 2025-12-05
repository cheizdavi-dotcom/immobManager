import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays as dfnsDifferenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
    const value = typeof amount === 'number' ? amount : 0;
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(value);
}

export function parseCurrency(value: string | number): number {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value !== 'string' || value.trim() === '') {
        return 0;
    }
    // Remove tudo que não for dígito
    const onlyDigits = value.replace(/\D/g, '');
    if (onlyDigits.length === 0) {
        return 0;
    }
    // Converte para centavos e depois para reais
    const number = parseInt(onlyDigits, 10) / 100;
    return isNaN(number) ? 0 : number;
}


export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  return dfnsDifferenceInDays(dateLeft, dateRight);
}
