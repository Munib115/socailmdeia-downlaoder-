import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'elevated' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-9 px-3.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2',
      lg: 'h-13 min-h-[52px] px-6 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-accent text-white hover:bg-accent-hover active:bg-blue-700 shadow-sm border border-transparent',
      secondary:
        'bg-surface text-text-primary hover:bg-elevated border border-border',
      elevated:
        'bg-elevated text-text-primary hover:bg-[#2D2D2D] border border-border',
      outline:
        'bg-transparent text-text-primary hover:bg-surface border border-border',
      danger:
        'bg-error text-white hover:bg-red-600 border border-transparent',
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50 border-transparent',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent select-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
