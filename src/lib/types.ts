export const expenseCategories = [
  'food',
  'transport',
  'internet',
  'personalCare',
  'entertainment',
  'rent',
  'others',
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

export type Expense = {
  id: string;
  userId: string;
  date: Date;
  category: ExpenseCategory;
  amount: number;
  note?: string;
};

export type MonthlyInfo = {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  monthlyBudget: number;
  monthlyFixedCost: number;
  dailyLimitAmount: number;
  dailyLimitEnabled: boolean;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type Loan = {
  id: string;
  userId: string;
  lenderName: string;
  initialAmount: number;
  amountPaid: number;
  loanDate: Date;
  status: 'active' | 'paid';
  note?: string;
}

export type LoanGiven = {
  id: string;
  userId: string;
  borrowerName: string;
  initialAmount: number;
  amountRepaid: number;
  loanDate: Date;
  status: 'active' | 'paid';
  note?: string;
}

    