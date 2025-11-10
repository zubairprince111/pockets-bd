'use client';

import type { Expense, MonthlyInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatCard } from './StatCard';
import { PocketVisual } from './PocketVisual';
import { CategorySpendPieChart } from './CategorySpendPieChart';
import { AddExpenseDialog } from './AddExpenseDialog';
import { EditBudgetDialog } from './EditBudgetDialog';
import { FloatingAddExpense } from './FloatingAddExpense';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { CATEGORIES } from '@/lib/constants';
import { format } from 'date-fns';
import { RecentExpenses } from './RecentExpenses';

interface DailyChartData {
  date: string;
  fullDate: string;
  total: number;
}

interface DashboardClientProps {
  monthlyInfo: MonthlyInfo;
  expenses: Expense[];
  onAddExpense: (newExpenseData: Omit<Expense, 'id' | 'userId'>) => void;
  onUpdateBudget: (budgetData: { monthlyBudget: number; monthlyFixedCost: number }) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  selectedDate: Date;
  onDeleteMonth: () => void;
  totalSpent: number;
  remainingBalance: number;
  isNextMonthInFuture: boolean;
}

export function DashboardClient({ 
  monthlyInfo, 
  expenses, 
  onAddExpense,
  onUpdateBudget,
  onPreviousMonth,
  onNextMonth,
  selectedDate,
  onDeleteMonth,
  totalSpent,
  remainingBalance,
  isNextMonthInFuture
}: DashboardClientProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const generateReport = () => {
    const doc = new jsPDF();
    const totalDailyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Monthly Expense Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Month: ${monthlyInfo.month}`, 14, 30);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Monthly Budget: ${formatCurrency(monthlyInfo.monthlyBudget)}`, 14, 40);
    doc.text(`Total Spent: ${formatCurrency(totalSpent)}`, 14, 47);
    doc.setTextColor(34, 139, 34); // green
    doc.text(`Remaining Balance: ${formatCurrency(remainingBalance)}`, 14, 54);
    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown:', 14, 70);
    let y = 77;
    doc.setFont('helvetica', 'normal');
    doc.text(`- Monthly Fixed Costs: ${formatCurrency(monthlyInfo.monthlyFixedCost)}`, 18, y);
    y += 7;
    doc.text(`- Total Daily Expenses: ${formatCurrency(totalDailyExpenses)}`, 18, y);
    y += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Category-wise Spending:', 14, y);
    y += 7;

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    doc.setFont('helvetica', 'normal');
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      const categoryLabel = t(CATEGORIES.find(c => c.value === cat)?.labelKey || cat);
      doc.text(`- ${categoryLabel}: ${formatCurrency(amount)}`, 18, y);
      y += 7;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('All Expenses:', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    expenses.forEach(expense => {
        const categoryLabel = t(CATEGORIES.find(c => c.value === expense.category)?.labelKey || expense.category);
        const dateString = format(expense.date, 'MMM d, yyyy');
        doc.text(`- ${dateString}: ${categoryLabel} - ${formatCurrency(expense.amount)} ${expense.note ? `(${expense.note})` : ''}`, 18, y);
        y+=7;
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    })

    doc.save(`Pockets-Report-${monthlyInfo.month}.pdf`);

    toast({
        title: t('reportGenerated'),
        description: t('reportGeneratedDesc'),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
            <AddExpenseDialog onAddExpense={onAddExpense} />
             <div className="flex items-center gap-1 rounded-lg border p-1">
                <Button variant="ghost" size="icon" onClick={onPreviousMonth} aria-label="Previous month">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="w-28 text-center text-sm font-medium">
                    {format(selectedDate, "MMMM yyyy")}
                </span>
                <Button variant="ghost" size="icon" onClick={onNextMonth} aria-label="Next month" disabled={isNextMonthInFuture}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={generateReport}>
                <Download className="mr-2 h-4 w-4" />
                {t('downloadReport')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-outline" size="icon" aria-label={t('deleteMonth')}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the budget and all associated expenses for {format(selectedDate, "MMMM yyyy")}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteMonth} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title={t('monthlyBudget')} 
          value={formatCurrency(monthlyInfo.monthlyBudget)} 
          action={<EditBudgetDialog monthlyInfo={monthlyInfo} onUpdateBudget={onUpdateBudget} />}
        />
        <StatCard title={t('spentThisMonth')} value={formatCurrency(totalSpent)} />
        <StatCard title={t('remainingBalance')} value={formatCurrency(remainingBalance)} variant={remainingBalance < 0 ? 'destructive' : 'default'} />
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
           <PocketVisual totalBudget={monthlyInfo.monthlyBudget} totalSpent={totalSpent} />
        </div>
        <div className="lg:col-span-2">
            <CategorySpendPieChart expenses={expenses} />
        </div>
      </div>

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
        <RecentExpenses expenses={expenses} />
      </div>

      <FloatingAddExpense onAddExpense={onAddExpense} />
    </div>
  );
}
