'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Expense } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CATEGORIES } from '@/lib/constants';

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const { t } = useLanguage();

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(cat => cat.value === categoryValue);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentExpenses')}</CardTitle>
        <CardDescription>Your latest transactions for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('note')}</TableHead>
                <TableHead className="text-right">{t('amount')}</TableHead>
                <TableHead className="hidden sm:table-cell text-right">{t('date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map(expense => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  const Icon = categoryInfo?.icon;
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           {Icon && <Icon className="h-4 w-4 text-muted-foreground hidden sm:block" />}
                           <span className="font-medium">{categoryInfo ? t(categoryInfo.labelKey) : expense.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate max-w-xs">{expense.note}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-xs">{format(expense.date, 'dd MMM')}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No expenses recorded for this month yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
