'use client';
import * as React from 'react';
import {Check, ChevronsUpDown, PlusCircle} from 'lucide-react';

import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Option = {
  value: string;
  label: string;
};

type CreatableComboboxProps = {
  options: Option[];
  value: string;
  onValueChange: (value: string, isNew: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  createPlaceholder?: (value: string) => string;
};

export function CreatableCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Pesquisar...',
  emptyPlaceholder = 'Nenhum item encontrado.',
  createPlaceholder = (value) => `Criar "${value}"`,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleSelect = (currentValue: string, isNew: boolean) => {
    onValueChange(isNew ? currentValue : currentValue === value ? '' : currentValue, isNew);
    setOpen(false);
  };
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = options.some(option => option.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                {!exactMatch && inputValue.trim() !== '' ? (
                    <div
                        onClick={() => handleSelect(inputValue, true)}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {createPlaceholder(inputValue)}
                    </div>
                ) : (
                    <p className="p-2 text-sm text-muted-foreground">{emptyPlaceholder}</p>
                )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentLabel) => {
                    const selectedOption = options.find(o => o.label.toLowerCase() === currentLabel.toLowerCase());
                    if (selectedOption) {
                      handleSelect(selectedOption.value, false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
             {!exactMatch && inputValue.trim() !== '' && (
                 <CommandItem
                    onSelect={() => handleSelect(inputValue, true)}
                    className="flex items-center gap-2 cursor-pointer text-blue-600"
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {createPlaceholder(inputValue)}
                </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
