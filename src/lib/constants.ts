import { Car, Home, MoreHorizontal, ShoppingBag, Sparkles, Ticket, UtensilsCrossed, Wifi } from 'lucide-react';
import type { ExpenseCategory } from './types';

export const CATEGORIES: {
  value: ExpenseCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'food', labelKey: 'food', icon: UtensilsCrossed },
  { value: 'transport', labelKey: 'transport', icon: Car },
  { value: 'internet', labelKey: 'internet', icon: Wifi },
  { value: 'rent', labelKey: 'rent', icon: Home },
  { value: 'personalCare', labelKey: 'personalCare', icon: Sparkles },
  { value: 'entertainment', labelKey: 'entertainment', icon: Ticket },
  { value: 'others', labelKey: 'others', icon: MoreHorizontal },
];

export const QUICK_ADD_EXPENSES: {
  category: ExpenseCategory;
  amount: number;
}[] = [
  { category: 'food', amount: 50 },
  { category: 'food', amount: 100 },
  { category: 'transport', amount: 20 },
  { category: 'transport', amount: 50 },
];
