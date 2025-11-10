'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

function PocketIcon({ className }: { className?: string; }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 20 V80 C5 95, 15 95, 30 95 H70 C85 95, 95 95, 95 80 V20 H5 Z" />
            <path d="M5 25 H95" strokeWidth="1.5" />
        </svg>
    );
}

interface PocketVisualProps {
  totalBudget: number;
  totalSpent: number;
}

export function PocketVisual({ totalBudget, totalSpent }: PocketVisualProps) {
    const { t } = useLanguage();

    const { remainingPercentage, statusColor, remainingAmount } = useMemo(() => {
        if (totalBudget <= 0) {
            return { remainingPercentage: 0, statusColor: 'bg-red-500', remainingAmount: 0 };
        }

        const spent = Math.max(0, totalSpent);
        const remaining = totalBudget - spent;
        const percentage = Math.max(0, (remaining / totalBudget) * 100);

        let color = 'bg-green-500';
        if (percentage <= 50) color = 'bg-yellow-500';
        if (percentage <= 20) color = 'bg-red-500';

        return {
            remainingPercentage: percentage,
            statusColor: color,
            remainingAmount: remaining
        };
    }, [totalBudget, totalSpent]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Pocket</CardTitle>
                <CardDescription>A visual representation of your remaining budget.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 h-64">
                <div className="relative w-28 h-28">
                     <div 
                        className="absolute bottom-[8px] left-[8px] right-[8px] h-[calc(100%-16px)] rounded-b-3xl overflow-hidden"
                    >
                        <div
                            className={cn('absolute bottom-0 w-full transition-all duration-700 ease-in-out', statusColor)}
                            style={{ height: `${remainingPercentage}%` }}
                        >
                             <div className="absolute -bottom-1 w-full h-4 bg-white/20 opacity-50 rounded-[50%] animate-pulse"/>
                        </div>
                    </div>
                    <PocketIcon className="absolute inset-0 w-full h-full text-foreground/50 z-10" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('remainingBalance')}</p>
                    <p className="text-2xl font-bold font-headline">{formatCurrency(remainingAmount)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
