import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تبدیل اعداد فارسی به انگلیسی
export function convertPersianToEnglish(input: string): string {
  return input.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
}

// محاسبه نتیجه یک ردیف آزمون
export function calculateRowResult(items: { value: string; operator: string }[]): string {
  if (!items.length) return '';
  let result = parseFloat(items[0].value);
  for (let i = 1; i < items.length; i++) {
    const op = items[i].operator;
    const val = parseFloat(items[i].value);
    switch (op) {
      case '+': result += val; break;
      case '-': result -= val; break;
      case '*': result *= val; break;
      case '/': result /= val; break;
      default: break;
    }
  }
  return String(result);
}
