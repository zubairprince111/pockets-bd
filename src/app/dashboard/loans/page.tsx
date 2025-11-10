'use client'

import { useUser, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Loan, LoanGiven } from '@/lib/types';
import { useMemo, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddLoanDialog } from '@/components/loans/AddLoanDialog';
import { LoanCard } from '@/components/loans/LoanCard';
import { LoanPaymentDialog } from '@/components/loans/LoanPaymentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddLoanGivenDialog } from '@/components/loans/AddLoanGivenDialog';
import { LoanGivenCard } from '@/components/loans/LoanGivenCard';
import { RecordPaymentGivenDialog } from '@/components/loans/RecordPaymentGivenDialog';

export default function LoansPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  // State for Loans Taken
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isPayLoanOpen, setIsPayLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // State for Loans Given
  const [isAddLoanGivenOpen, setIsAddLoanGivenOpen] = useState(false);
  const [isRecordPaymentGivenOpen, setIsRecordPaymentGivenOpen] = useState(false);
  const [selectedLoanGiven, setSelectedLoanGiven] = useState<LoanGiven | null>(null);

  // Firestore query for Loans Taken
  const loansQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/loans`),
      orderBy('loanDate', 'desc')
    );
  }, [firestore, user]);
  const { data: rawLoansData, isLoading: loansLoading } = useCollection<Loan>(loansQuery);
  const loans = useMemo(() => {
    if (!rawLoansData) return [];
    return rawLoansData.map(l => ({
        ...l,
        loanDate: l.loanDate instanceof Timestamp ? l.loanDate.toDate() : new Date(l.loanDate),
    }));
  }, [rawLoansData]);

  // Firestore query for Loans Given
  const loansGivenQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/loansGiven`),
      orderBy('loanDate', 'desc')
    );
  }, [firestore, user]);
  const { data: rawLoansGivenData, isLoading: loansGivenLoading } = useCollection<LoanGiven>(loansGivenQuery);
  const loansGiven = useMemo(() => {
    if (!rawLoansGivenData) return [];
    return rawLoansGivenData.map(l => ({
        ...l,
        loanDate: l.loanDate instanceof Timestamp ? l.loanDate.toDate() : new Date(l.loanDate),
    }));
  }, [rawLoansGivenData]);

  // Handlers for Loans Taken
  const handleAddLoan = useCallback((newLoanData: Omit<Loan, 'id' | 'userId' | 'amountPaid' | 'status'>) => {
    if (!user || !firestore) return;
    const loanRef = doc(collection(firestore, `users/${user.uid}/loans`));
    const loanToSave = {
      ...newLoanData,
      id: loanRef.id,
      userId: user.uid,
      amountPaid: 0,
      status: 'active' as 'active' | 'paid',
      loanDate: Timestamp.fromDate(newLoanData.loanDate),
      createdAt: serverTimestamp(),
    }
    setDocumentNonBlocking(loanRef, loanToSave);
    toast({ title: 'Loan Added', description: `Loan from ${newLoanData.lenderName} has been recorded.` });
    setIsAddLoanOpen(false);
  }, [user, firestore, toast]);

  const handleRecordPayment = useCallback((loan: Loan, paymentAmount: number) => {
    if (!user || !firestore) return;
    const loanRef = doc(firestore, `users/${user.uid}/loans`, loan.id);
    const newAmountPaid = loan.amountPaid + paymentAmount;
    const updatedData: Partial<Loan> = { amountPaid: newAmountPaid };
    if (newAmountPaid >= loan.initialAmount) {
      updatedData.status = 'paid';
    }
    setDocumentNonBlocking(loanRef, updatedData, { merge: true });
    toast({ title: 'Payment Recorded', description: `Payment for loan from ${loan.lenderName} recorded.` });
    setIsPayLoanOpen(false);
  }, [user, firestore, toast]);

  const handleDeleteLoan = useCallback((loanId: string) => {
    if (!user || !firestore) return;
    const loanRef = doc(firestore, `users/${user.uid}/loans`, loanId);
    deleteDocumentNonBlocking(loanRef);
    toast({ title: 'Loan Deleted', description: 'The loan has been removed.' });
  }, [user, firestore, toast]);

  const openPaymentDialog = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPayLoanOpen(true);
  }

  // Handlers for Loans Given
  const handleAddLoanGiven = useCallback((newLoanGivenData: Omit<LoanGiven, 'id' | 'userId' | 'amountRepaid' | 'status'>) => {
    if (!user || !firestore) return;
    const loanGivenRef = doc(collection(firestore, `users/${user.uid}/loansGiven`));
    const loanToSave = {
      ...newLoanGivenData,
      id: loanGivenRef.id,
      userId: user.uid,
      amountRepaid: 0,
      status: 'active' as 'active' | 'paid',
      loanDate: Timestamp.fromDate(newLoanGivenData.loanDate),
      createdAt: serverTimestamp(),
    }
    setDocumentNonBlocking(loanGivenRef, loanToSave);
    toast({ title: 'Loan Recorded', description: `Loan to ${newLoanGivenData.borrowerName} has been recorded.` });
    setIsAddLoanGivenOpen(false);
  }, [user, firestore, toast]);

  const handleRecordRepayment = useCallback((loan: LoanGiven, repaymentAmount: number) => {
    if (!user || !firestore) return;
    const loanGivenRef = doc(firestore, `users/${user.uid}/loansGiven`, loan.id);
    const newAmountRepaid = loan.amountRepaid + repaymentAmount;
    const updatedData: Partial<LoanGiven> = { amountRepaid: newAmountRepaid };
    if (newAmountRepaid >= loan.initialAmount) {
      updatedData.status = 'paid';
    }
    setDocumentNonBlocking(loanGivenRef, updatedData, { merge: true });
    toast({ title: 'Repayment Recorded', description: `Repayment from ${loan.borrowerName} recorded.` });
    setIsRecordPaymentGivenOpen(false);
  }, [user, firestore, toast]);

  const handleDeleteLoanGiven = useCallback((loanGivenId: string) => {
    if (!user || !firestore) return;
    const loanGivenRef = doc(firestore, `users/${user.uid}/loansGiven`, loanGivenId);
    deleteDocumentNonBlocking(loanGivenRef);
    toast({ title: 'Loan Record Deleted', description: 'The loan record has been removed.' });
  }, [user, firestore, toast]);

  const openRecordRepaymentDialog = (loan: LoanGiven) => {
    setSelectedLoanGiven(loan);
    setIsRecordPaymentGivenOpen(true);
  }

  const isLoading = isUserLoading || loansLoading || loansGivenLoading;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><p>Loading loans...</p></div>;
  }
  
  if (!user) {
    return <div className="flex justify-center items-center h-full"><p>Please log in to view your loans.</p></div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Loans</h2>
       <Tabs defaultValue="taken" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="taken">{t('loansTaken')}</TabsTrigger>
            <TabsTrigger value="given">{t('loansGiven')}</TabsTrigger>
        </TabsList>
        <TabsContent value="taken" className="mt-6">
            <div className="flex justify-end items-center">
                <AddLoanDialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen} onAddLoan={handleAddLoan}>
                    <Button onClick={() => setIsAddLoanOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Loan Taken
                    </Button>
                </AddLoanDialog>
            </div>
            {loans.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {loans.map(loan => (
                    <LoanCard 
                    key={loan.id} 
                    loan={loan}
                    onRecordPayment={() => openPaymentDialog(loan)}
                    onDelete={() => handleDeleteLoan(loan.id)}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                    <h3 className="text-xl font-medium text-muted-foreground">No loans recorded yet.</h3>
                    <p className="text-sm text-muted-foreground mt-2">Click "Add Loan Taken" to get started.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="given" className="mt-6">
            <div className="flex justify-end items-center">
                 <AddLoanGivenDialog open={isAddLoanGivenOpen} onOpenChange={setIsAddLoanGivenOpen} onAddLoanGiven={handleAddLoanGiven}>
                    <Button onClick={() => setIsAddLoanGivenOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Loan Given
                    </Button>
                </AddLoanGivenDialog>
            </div>
             {loansGiven.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {loansGiven.map(loan => (
                    <LoanGivenCard
                    key={loan.id} 
                    loan={loan}
                    onRecordRepayment={() => openRecordRepaymentDialog(loan)}
                    onDelete={() => handleDeleteLoanGiven(loan.id)}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                    <h3 className="text-xl font-medium text-muted-foreground">You haven't recorded any loans given.</h3>
                    <p className="text-sm text-muted-foreground mt-2">Click "Add Loan Given" to get started.</p>
                </div>
            )}
        </TabsContent>
       </Tabs>
      
      {selectedLoan && (
        <LoanPaymentDialog
            loan={selectedLoan}
            open={isPayLoanOpen}
            onOpenChange={setIsPayLoanOpen}
            onRecordPayment={handleRecordPayment}
        />
      )}

      {selectedLoanGiven && (
        <RecordPaymentGivenDialog
            loan={selectedLoanGiven}
            open={isRecordPaymentGivenOpen}
            onOpenChange={setIsRecordPaymentGivenOpen}
            onRecordRepayment={handleRecordRepayment}
        />
      )}
    </div>
  );
}

    