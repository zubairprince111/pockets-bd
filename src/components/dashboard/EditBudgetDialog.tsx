'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { MonthlyInfo } from '@/lib/types';

const budgetSchema = z.object({
    monthlyBudget: z.coerce.number().min(1, "Monthly budget must be greater than 0."),
    monthlyFixedCost: z.coerce.number().min(0, "Fixed costs cannot be negative."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface EditBudgetDialogProps {
    monthlyInfo: MonthlyInfo;
    onUpdateBudget: (data: BudgetFormValues) => void;
}

export function EditBudgetDialog({ monthlyInfo, onUpdateBudget }: EditBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      monthlyBudget: monthlyInfo.monthlyBudget,
      monthlyFixedCost: monthlyInfo.monthlyFixedCost,
    },
  });

  function onSubmit(values: BudgetFormValues) {
    onUpdateBudget(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
            <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editBudget')}</DialogTitle>
          <DialogDescription>
            Adjust your monthly budget and fixed costs as needed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="monthlyBudget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('monthlyBudget')}</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="monthlyFixedCost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('fixedCosts')}</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
