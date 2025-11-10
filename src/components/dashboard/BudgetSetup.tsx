'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';

const budgetSchema = z.object({
    monthlyBudget: z.coerce.number().min(1, "Monthly budget must be greater than 0."),
    monthlyFixedCost: z.coerce.number().min(0, "Fixed costs cannot be negative."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetSetupProps {
    onBudgetSetup: (data: BudgetFormValues) => void;
    currentMonth: string; // YYYY-MM
}

export function BudgetSetup({ onBudgetSetup, currentMonth }: BudgetSetupProps) {
    const { t } = useLanguage();

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            monthlyBudget: 0,
            monthlyFixedCost: 0,
        },
    });

    function onSubmit(values: BudgetFormValues) {
        onBudgetSetup(values);
    }
    
    const formattedMonth = format(new Date(currentMonth), "MMMM yyyy");

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Set Up Budget for {formattedMonth}</CardTitle>
                    <CardDescription>Let's get started by defining your budget for this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="monthlyBudget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('monthlyBudget')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., ৳ 20000" {...field} />
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
                                            <Input type="number" placeholder="e.g., Rent, Bills" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">{t('save')}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
