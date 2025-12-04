import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays as dfnsDifferenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined) {
  const value = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numberString = value.replace(/\D/g, '');
    const number = parseFloat(numberString) / 100;
    return isNaN(number) ? 0 : number;
}


export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  return dfnsDifferenceInDays(dateLeft, dateRight);
}

    
