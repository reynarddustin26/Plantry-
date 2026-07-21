import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SelectableCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: ReactNode;
}

export function SelectableCard({
  selected = false,
  className,
  children,
  ...props
}: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'min-h-[44px] w-full rounded-lg border-2 bg-card p-4 text-left text-card-foreground shadow-sm transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected ? 'border-primary bg-muted' : 'border-border hover:border-primary/50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
