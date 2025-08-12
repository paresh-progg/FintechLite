export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO 8601 date string
  notes?: string;
};

export type Budget = {
  category: string;
  amount: number;
};
