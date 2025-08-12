'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Search, PlusCircle, Calendar as CalendarIcon, ChevronsUpDown, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

type TransactionFiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  dateRange?: DateRange;
  setDateRange: (dateRange?: DateRange) => void;
  categories: string[];
  onAddTransaction: () => void;
};

export default function TransactionFilters({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  dateRange,
  setDateRange,
  categories,
  onAddTransaction
}: TransactionFiltersProps) {
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDateRange(undefined);
  }

  const areFiltersActive = searchQuery || selectedCategories.length > 0 || dateRange;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by category or notes..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full md:w-auto justify-start">
            <ChevronsUpDown className="mr-2 h-4 w-4" />
            Categories
            {selectedCategories.length > 0 && <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{selectedCategories.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Filter categories..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                {categories.map((category) => (
                    <CommandItem
                    key={category}
                    onSelect={() => handleCategoryToggle(category)}
                    className="cursor-pointer"
                    >
                    <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedCategories.includes(category) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span>{category}</span>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full md:w-auto justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {areFiltersActive && (
        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}

      <div className="md:ml-auto">
        <Button onClick={onAddTransaction}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
        </Button>
      </div>
    </div>
  );
}
