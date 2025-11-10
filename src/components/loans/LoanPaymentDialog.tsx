'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Loan } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';


interface LoanPaymentDialogProps {
    loan: Loan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRecordPayment: (loan: Loan, paymentAmount: number) => void;
}

export function LoanPaymentDialog({ open, onOpenChange, onRecordPayment, loan }: LoanPaymentDialogProps) {
  const { t } = useLanguage();
  const remainingAmount = loan.initialAmount - loan.amountPaid;

  const paymentSchema = z.object({
    paymentAmount: z.coerce
      .number()
      .min(0.01, "Payment must be greater than 0.")
      .max(remainingAmount, `Payment cannot exceed remaining amount of ${formatCurrency(remainingAmount)}`),
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentAmount: 0,
    },
  });

  function onSubmit(values: PaymentFormValues) {
    onRecordPayment(loan, values.paymentAmount);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record a Payment</DialogTitle>
          <DialogDescription>
            Recording a payment for the loan from {loan.lenderName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="text-center p-4 bg-muted/50 rounded-md">
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className="text-3xl font-bold">{formatCurrency(remainingAmount)}</p>
                </div>
                <FormField
                    control={form.control}
                    name="paymentAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Amount you paid" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
                    <Button type="submit">Record Payment</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
