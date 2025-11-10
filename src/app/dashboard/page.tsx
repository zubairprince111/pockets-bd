'use client'

import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, Timestamp, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Expense, MonthlyInfo } from '@/lib/types';
import { useMemo, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { BudgetSetup } from '@/components/dashboard/BudgetSetup';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStr = format(selectedDate, 'yyyy-MM');

  const monthlyInfoQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/monthlyInfo`),
      where('month', '==', monthStr)
    );
  }, [firestore, user, monthStr]);

  const expensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return query(
        collection(firestore, `users/${user.uid}/dailyExpenses`),
        where('date', '>=', start),
        where('date', '<=', end)
    );
  }, [firestore, user, selectedDate]);

  const { data: monthlyInfoData, isLoading: monthlyInfoLoading } = useCollection<MonthlyInfo>(monthlyInfoQuery);
  const { data: rawExpensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  
  const expenses = useMemo(() => {
    if (!rawExpensesData) return [];
    return rawExpensesData.map(e => ({
        ...e,
        date: e.date instanceof Timestamp ? e.date.toDate() : new Date(e.date),
    })).sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [rawExpensesData]);

  const monthlyInfo = useMemo(() => (monthlyInfoData && monthlyInfoData.length > 0) ? monthlyInfoData[0] : null, [monthlyInfoData]);

  const totalDailyExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );
  
  const totalSpent = useMemo(() => 
    totalDailyExpenses + (monthlyInfo?.monthlyFixedCost || 0),
    [totalDailyExpenses, monthlyInfo]
  );

  const remainingBalance = useMemo(() =>
    (monthlyInfo?.monthlyBudget || 0) - totalSpent,
    [monthlyInfo, totalSpent]
  );

  const isNextMonthInFuture = useMemo(() => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1); // set to first day of next month
    return nextMonth > new Date();
  }, [selectedDate]);
  
  const handleAddExpense = useCallback(async (newExpenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!user || !firestore || !monthlyInfo) return;
    
    const expenseToSave = {
      ...newExpenseData,
      userId: user.uid,
      date: Timestamp.fromDate(newExpenseData.date),
      createdAt: serverTimestamp(),
    }
    const expensesColRef = collection(firestore, `users/${user.uid}/dailyExpenses`);
    addDocumentNonBlocking(expensesColRef, expenseToSave);

    toast({
      title: t('expenseAdded'),
      description: t('expenseAddedDesc'),
    });

  }, [user, firestore, t, toast, monthlyInfo, language, totalSpent, expenses]);

  const handleBudgetSetup = useCallback((budgetData: { monthlyBudget: number, monthlyFixedCost: number }) => {
    if (!user || !firestore) return;

    const monthlyInfoRef = doc(collection(firestore, `users/${user.uid}/monthlyInfo`));

    const newMonthlyInfo: Omit<MonthlyInfo, 'userId'> & {userId: string} = {
        id: monthlyInfoRef.id,
        userId: user.uid,
        month: monthStr,
        monthlyBudget: budgetData.monthlyBudget,
        monthlyFixedCost: budgetData.monthlyFixedCost,
        dailyLimitAmount: 0,
        dailyLimitEnabled: false,
    }

    setDocumentNonBlocking(monthlyInfoRef, newMonthlyInfo, {merge: false});
    
    toast({
      title: t('budgetUpdated'),
      description: t('budgetUpdatedDesc'),
    });
  }, [user, firestore, monthStr, t, toast]);

  const handleUpdateBudget = useCallback((budgetData: { monthlyBudget: number, monthlyFixedCost: number }) => {
    if (!user || !firestore || !monthlyInfo) return;

    const monthlyInfoRef = doc(firestore, `users/${user.uid}/monthlyInfo`, monthlyInfo.id);

    setDocumentNonBlocking(monthlyInfoRef, {
      monthlyBudget: budgetData.monthlyBudget,
      monthlyFixedCost: budgetData.monthlyFixedCost,
    }, { merge: true });

    toast({
      title: t('budgetUpdated'),
      description: t('budgetUpdatedDesc'),
    });
  }, [user, firestore, monthlyInfo, t, toast]);


  const handleDeleteMonth = useCallback(async () => {
    if (!user || !firestore || !monthlyInfo || !rawExpensesData) return;

    try {
        const batch = writeBatch(firestore);

        // Delete the monthlyInfo document
        const monthlyInfoRef = doc(firestore, `users/${user.uid}/monthlyInfo`, monthlyInfo.id);
        batch.delete(monthlyInfoRef);

        // Delete all expenses for the month
        rawExpensesData.forEach(expense => {
            const expenseRef = doc(firestore, `users/${user.uid}/dailyExpenses`, expense.id);
            batch.delete(expenseRef);
        });

        await batch.commit();

        toast({
            title: "Month Deleted",
            description: `The data for ${format(selectedDate, 'MMMM yyyy')} has been deleted.`,
        });
    } catch (error) {
        console.error("Error deleting month data: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete month data. Please try again.",
        });
    }
  }, [user, firestore, monthlyInfo, rawExpensesData, selectedDate, toast]);


  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };

  const isLoading = isUserLoading || monthlyInfoLoading || expensesLoading;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><p>Loading dashboard...</p></div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-full"><p>Please log in to view your dashboard.</p></div>
  }
  
  if (!monthlyInfo) {
    return <BudgetSetup onBudgetSetup={handleBudgetSetup} currentMonth={monthStr} />;
  }

  return (
    <DashboardClient 
      monthlyInfo={monthlyInfo}
      expenses={expenses}
      onAddExpense={handleAddExpense}
      onPreviousMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
      selectedDate={selectedDate}
      onDeleteMonth={handleDeleteMonth}
      onUpdateBudget={handleUpdateBudget}
      totalSpent={totalSpent}
      remainingBalance={remainingBalance}
      isNextMonthInFuture={isNextMonthInFuture}
    />
  );
}
