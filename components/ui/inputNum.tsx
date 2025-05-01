import * as React from 'react';
import { cn } from '@/lib/utils';

// @ts-ignore
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ className, value, onChange, min = 0, max = 999999, step = 1, ...props }, ref) => {
        // State for touch handling
        const [isTouching, setIsTouching] = React.useState(false);
        const touchTimeoutRef = React.useRef<NodeJS.Timeout>();
        const longPressIntervalRef = React.useRef<NodeJS.Timeout>();

        const handleIncrease = () => {
            if (value < max) {
                onChange(Math.min(max, value + step));
            }
        };

        const handleDecrease = () => {
            if (value > min) {
                onChange(Math.max(min, value - step));
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseInt(e.target.value);
            if (!isNaN(newValue)) {
                if (newValue > max) {
                    onChange(max);
                } else if (newValue < min) {
                    onChange(min);
                } else {
                    onChange(newValue);
                }
            }
        };

        // Handle long press for continuous increment/decrement
        const startLongPress = (action: 'increase' | 'decrease') => {
            setIsTouching(true);

            // Initial delay before starting continuous change
            touchTimeoutRef.current = setTimeout(() => {
                longPressIntervalRef.current = setInterval(() => {
                    action === 'increase' ? handleIncrease() : handleDecrease();
                }, 100); // Adjust interval for speed of continuous change
            }, 500); // Adjust initial delay as needed
        };

        const endLongPress = () => {
            setIsTouching(false);
            if (touchTimeoutRef.current) {
                clearTimeout(touchTimeoutRef.current);
            }
            if (longPressIntervalRef.current) {
                clearInterval(longPressIntervalRef.current);
            }
        };

        // Cleanup on unmount
        React.useEffect(() => {
            return () => {
                if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
                if (longPressIntervalRef.current) clearInterval(longPressIntervalRef.current);
            };
        }, []);

        return (
            <div className={cn(
                'flex h-12 sm:h-14 md:h-16 rounded-lg overflow-hidden border border-input bg-background',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
                'transition-all duration-200 touch-none select-none',
                className
            )}>
                <button
                    type="button"
                    onClick={handleDecrease}
                    onTouchStart={() => startLongPress('decrease')}
                    onTouchEnd={endLongPress}
                    onTouchCancel={endLongPress}
                    onMouseDown={() => startLongPress('decrease')}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    className={cn(
                        'flex-none w-12 sm:w-14 md:w-16 flex items-center justify-center',
                        'text-xl sm:text-2xl font-semibold text-foreground',
                        'hover:bg-muted active:bg-muted/80',
                        'transition-colors duration-200',
                        'active:scale-95',
                        'touch-none select-none',
                        (value <= min || isTouching) && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={value <= min}
                >
                    -
                </button>

                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    ref={ref}
                    className={cn(
                        'flex-1 px-2 text-center',
                        'text-base sm:text-lg md:text-xl font-medium',
                        'border-x border-input bg-transparent',
                        'focus:outline-none',
                        'appearance-none',
                        '[&::-webkit-outer-spin-button]:appearance-none',
                        '[&::-webkit-inner-spin-button]:appearance-none',
                        '[&::-webkit-inner-spin-button]:m-0',
                        'touch-none'
                    )}
                    {...props}
                />

                <button
                    type="button"
                    onClick={handleIncrease}
                    onTouchStart={() => startLongPress('increase')}
                    onTouchEnd={endLongPress}
                    onTouchCancel={endLongPress}
                    onMouseDown={() => startLongPress('increase')}
                    onMouseUp={endLongPress}
                    onMouseLeave={endLongPress}
                    className={cn(
                        'flex-none w-12 sm:w-14 md:w-16 flex items-center justify-center',
                        'text-xl sm:text-2xl font-semibold text-foreground',
                        'hover:bg-muted active:bg-muted/80',
                        'transition-colors duration-200',
                        'active:scale-95',
                        'touch-none select-none',
                        (value >= max || isTouching) && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={value >= max}
                >
                    +
                </button>
            </div>
        );
    }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
