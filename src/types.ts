export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string; // HSL color or class name
}

export type TransactionType = 'pemasukan' | 'pengeluaran' | 'tabungan';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  goalId?: string; // Optional link to a SavingsGoal
}
