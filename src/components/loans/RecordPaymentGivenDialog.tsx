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
import type { LoanGiven } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatCurrency } from '@/lib/utils';


interface RecordPaymentGivenDialogProps {
    loan: LoanGiven;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRecordRepayment: (loan: LoanGiven, repaymentAmount: number) => void;
}

export function RecordPaymentGivenDialog({ open, onOpenChange, onRecordRepayment, loan }: RecordPaymentGivenDialogProps) {
  const { t } = useLanguage();
  const remainingAmount = loan.initialAmount - loan.amountRepaid;

  const paymentSchema = z.object({
    repaymentAmount: z.coerce
      .number()
      .min(0.01, "Repayment must be greater than 0.")
      .max(remainingAmount, `Repayment cannot exceed remaining amount of ${formatCurrency(remainingAmount)}`),
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      repaymentAmount: 0,
    },
  });

  function onSubmit(values: PaymentFormValues) {
    onRecordRepayment(loan, values.repaymentAmount);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record a Repayment</DialogTitle>
          <DialogDescription>
            Recording a repayment for the loan to {loan.borrowerName}.
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
                    name="repaymentAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Repayment Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Amount they repaid" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
                    <Button type="submit">Record Repayment</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    