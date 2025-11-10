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
import type { Loan } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';

const loanSchema = z.object({
    lenderName: z.string().min(1, "Lender's name is required."),
    initialAmount: z.coerce.number().min(1, "Amount must be greater than 0."),
    loanDate: z.date(),
    note: z.string().max(100, "Note must be 100 characters or less.").optional(),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface AddLoanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddLoan: (loan: Omit<Loan, 'id' | 'userId' | 'amountPaid' | 'status'>) => void;
    children: React.ReactNode;
}

export function AddLoanDialog({ open, onOpenChange, onAddLoan, children }: AddLoanDialogProps) {
  const { t } = useLanguage();

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      lenderName: '',
      initialAmount: 0,
      loanDate: new Date(),
      note: '',
    },
  });

  function onSubmit(values: LoanFormValues) {
    onAddLoan(values);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Loan</DialogTitle>
          <DialogDescription>
            Keep track of money you've borrowed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="lenderName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lender's Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., John Doe" {...field} />
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
                                <Textarea placeholder="e.g., For monthly groceries" {...field} />
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
