import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function StatCard({ title, value, icon: Icon, action, variant = 'default' }: StatCardProps) {
  return (
    <Card className={cn(
        'transition-all hover:shadow-md',
        variant === 'destructive' && 'bg-destructive/10 border-destructive/50'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {action ? action : (Icon && <Icon className="h-4 w-4 text-muted-foreground" />)}
      </CardHeader>
      <CardContent>
        <div className={cn(
            "text-2xl font-bold font-headline",
            variant === 'destructive' && 'text-destructive'
        )}>
            {value}
        </div>
      </CardContent>
    </Card>
  );
}
