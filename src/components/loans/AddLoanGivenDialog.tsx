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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { LoanGiven } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';

const loanGivenSchema = z.object({
    borrowerName: z.string().min(1, "Borrower's name is required."),
    initialAmount: z.coerce.number().min(1, "Amount must be greater than 0."),
    loanDate: z.date(),
    note: z.string().max(100, "Note must be 100 characters or less.").optional(),
});

type LoanGivenFormValues = z.infer<typeof loanGivenSchema>;

interface AddLoanGivenDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddLoanGiven: (loan: Omit<LoanGiven, 'id' | 'userId' | 'amountRepaid' | 'status'>) => void;
    children: React.ReactNode;
}

export function AddLoanGivenDialog({ open, onOpenChange, onAddLoanGiven, children }: AddLoanGivenDialogProps) {
  const { t } = useLanguage();

  const form = useForm<LoanGivenFormValues>({
    resolver: zodResolver(loanGivenSchema),
    defaultValues: {
      borrowerName: '',
      initialAmount: 0,
      loanDate: new Date(),
      note: '',
    },
  });

  function onSubmit(values: LoanGivenFormValues) {
    onAddLoanGiven(values);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Loan Given</DialogTitle>
          <DialogDescription>
            Keep track of money you've lent to others.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="borrowerName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Borrower's Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="initialAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loan Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="৳ 5000" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="loanDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Loan</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('note')} (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., For their monthly rent" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    