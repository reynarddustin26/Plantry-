'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover, cardHoverTransition, cardTap, staggerItem } from '@/lib/motion';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={cardHover}
      transition={cardHoverTransition}
      className={cn(
        'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm lg:p-6',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

type SelectableCardProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> & {
  selected?: boolean;
  children: ReactNode;
};

export function SelectableCard({
  selected = false,
  className,
  children,
  ...props
}: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      variants={staggerItem}
      whileHover={cardHover}
      whileTap={cardTap}
      transition={cardHoverTransition}
      className={cn(
        'min-h-[44px] w-full rounded-lg border-2 bg-card p-4 text-left text-card-foreground shadow-sm transition-colors lg:p-6',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected ? 'border-primary bg-muted' : 'border-border hover:border-primary/50',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
