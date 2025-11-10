'use client';

import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Expense } from '@/lib/types';
import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Label } from '../ui/label';

interface CategorySpendPieChartProps {
  expenses: Expense[];
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];


export function CategorySpendPieChart({ expenses }: CategorySpendPieChartProps) {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: t(CATEGORIES.find(c => c.value === category)?.labelKey || category),
        amount,
        fill: chartColors[Object.keys(categoryTotals).indexOf(category) % chartColors.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, t]);
  
  const totalSpend = useMemo(() => chartData.reduce((sum, item) => sum + item.amount, 0), [chartData]);

  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('categorySpend')}</CardTitle>
                <CardDescription>No expenses recorded this month.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Add an expense to see your spending breakdown.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categorySpend')}</CardTitle>
        <CardDescription>Breakdown of your spending by category.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
         <ChartContainer config={{}} className="mx-auto aspect-square h-64">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent
                  hideLabel 
                  formatter={(value, name, item) => (
                    <div className='flex justify-between w-full'>
                        <span className='font-medium'>{item.payload.payload.category}</span>
                        <span>{formatCurrency(value as number)}</span>
                    </div>
                  )}
                />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
      </CardContent>
    </Card>
  );
}
