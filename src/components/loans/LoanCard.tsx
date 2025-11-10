'use client';

import type { Loan } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface LoanCardProps {
    loan: Loan;
    onRecordPayment: (loan: Loan) => void;
    onDelete: (loanId: string) => void;
}

export function LoanCard({ loan, onRecordPayment, onDelete }: LoanCardProps) {
    const remainingAmount = loan.initialAmount - loan.amountPaid;
    const progress = (loan.amountPaid / loan.initialAmount) * 100;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{loan.lenderName}</CardTitle>
                    <CardDescription>Loan taken on {format(loan.loanDate, 'd MMM, yyyy')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={loan.status === 'paid' ? 'secondary' : 'default'} className="capitalize">
                        {loan.status}
                    </Badge>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRecordPayment(loan)} disabled={loan.status === 'paid'}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(loan.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-medium">{formatCurrency(loan.amountPaid)}</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                    </div>
                </div>
                {loan.note && (
                     <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
                        {loan.note}
                    </p>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
                 <p className="text-lg font-bold w-full text-right">
                    {formatCurrency(loan.initialAmount)}
                </p>
                <p className="text-xs text-muted-foreground w-full text-right">Total Loan Amount</p>
            </CardFooter>
        </Card>
    )
}
