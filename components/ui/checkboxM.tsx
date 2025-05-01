'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const CheckboxM = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            'peer h-6 w-6 md:h-7 md:w-7 shrink-0 rounded-lg border-2 border-input',
            'ring-offset-background transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'hover:border-emerald-400/50',
            'data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500',
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={cn(
                'flex items-center justify-center text-white',
                'animate-in zoom-in-75 duration-200'
            )}
        >
            <Check className="h-5 w-5 md:h-6 md:w-6 stroke-[3]" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));

CheckboxM.displayName = CheckboxPrimitive.Root.displayName;

export { CheckboxM };