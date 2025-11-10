'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { CATEGORIES } from '@/lib/constants';

const LAST_USED_CATEGORY_KEY = 'pockets-last-used-category';

const quickAddSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  note: z.string().optional(),
});

type QuickAddFormValues = z.infer<typeof quickAddSchema>;

interface FloatingAddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'userId'>) => void;
}

export function FloatingAddExpense({ onAddExpense }: FloatingAddExpenseProps) {
  const [open, setOpen] = useState(false);
  const [lastUsedCategory, setLastUsedCategory] = useState<ExpenseCategory>('others');
  const { t } = useLanguage();

  useEffect(() => {
    const savedCategory = localStorage.getItem(LAST_USED_CATEGORY_KEY) as ExpenseCategory;
    if (savedCategory && CATEGORIES.some(c => c.value === savedCategory)) {
      setLastUsedCategory(savedCategory);
    }
  }, []);

  const form = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      amount: undefined,
      note: '',
    },
  });

  useEffect(() => {
    // When the popover opens, focus the amount input
    if (open) {
        setTimeout(() => form.setFocus('amount'), 50);
    }
  }, [open, form]);

  const onSubmit = (values: QuickAddFormValues) => {
    onAddExpense({
        amount: values.amount,
        category: lastUsedCategory,
        date: new Date(),
        note: values.note || 'Quick Add'
    });
    form.reset();
    setOpen(false);
  }

  const lastCategoryInfo = CATEGORIES.find(c => c.value === lastUsedCategory);
  const lastCategoryLabel = lastCategoryInfo ? t(lastCategoryInfo.labelKey) : lastUsedCategory;


  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
                size="icon"
            >
                <Plus className="h-8 w-8" />
                <span className="sr-only">Add Expense</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mr-4 mb-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <p className="text-sm text-center font-medium text-muted-foreground">
                            Adding expense to <span className="font-bold text-foreground">{lastCategoryLabel}</span>
                        </p>
                         <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="Enter amount" 
                                            className="text-center text-lg h-12"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="text" placeholder="Optional note" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Add</Button>
                    </div>
                </form>
            </Form>
        </PopoverContent>
    </Popover>
  );
}
