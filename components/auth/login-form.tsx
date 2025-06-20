'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@prisma/client';
import { Loader2 } from 'lucide-react';

// Utility function to convert Persian numbers to English numbers
const convertPersianToEnglish = (str: string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.split('').map(char => {
    const index = persianNumbers.indexOf(char);
    return index !== -1 ? index.toString() : char;
  }).join('');
};

interface LoginFormProps {
  role: string;
}

const studentSchema = z.object({
  nationalId: z.string().min(10, 'کد ملی باید ۱۰ رقم باشد').max(10, 'کد ملی باید ۱۰ رقم باشد'),
  password: z.string().min(10, 'شماره موبایل باید ۱۱ رقم باشد').max(11, 'شماره موبایل باید ۱۱ رقم باشد'),
});

const adminSchema = z.object({
  email: z.string().min(1, 'ایمیل الزامی است').email('ایمیل نامعتبر است'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

export function LoginForm({ role }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isStudent = role === 'STUDENT';
  const schema = isStudent ? studentSchema : adminSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: isStudent 
      ? { nationalId: '', password: '' }
      : { email: '', password: '' }
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
      const loginData = isStudent 
        ? { 
            identifier: convertPersianToEnglish((values as { nationalId: string }).nationalId), 
            password: convertPersianToEnglish(values.password), 
            role: 'STUDENT' 
          }
        : { 
            identifier: (values as { email: string }).email, 
            password: values.password, 
            role: 'ADMIN' 
          };

      const callbackUrl = isStudent ? '/student/dashboard' : '/admin/dashboard';
      
      const result = await signIn('credentials', {
        ...loginData,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        toast({
          title: "خطا در ورود",
          description: "اطلاعات وارد شده صحیح نمی‌باشد.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast({
          title: "ورود موفق",
          description: "به سامانه آزمون آنلاین خوش آمدید.",
          className: "bg-green-600 border-green-700 text-white",
          duration: 3000,
        });

        // Clear any existing cache
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('next-auth.session-token');
          window.localStorage.removeItem('next-auth.callback-url');
          window.localStorage.removeItem('next-auth.csrf-token');
        }

        // Use replace instead of push for more reliable navigation
        router.replace(callbackUrl);
      }
    } catch (error) {
      toast({
        title: "خطا در ورود",
        description: "مشکلی در سیستم رخ داده است. لطفا دوباره تلاش کنید.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isStudent ? (
          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">کد ملی</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="کد ملی خود را وارد کنید" 
                    {...field} 
                    disabled={isLoading}
                    className="text-right placeholder:text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">ایمیل</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="ایمیل خود را وارد کنید" 
                    {...field} 
                    disabled={isLoading}
                    className="text-right placeholder:text-right"
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage className="text-right" />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-right block">{isStudent ? 'شماره موبایل' : 'رمز عبور'}</FormLabel>
              <FormControl>
                <Input 
                  type={isStudent ? "text" : "password"} 
                  placeholder={isStudent ? "شماره موبایل خود را وارد کنید" : "رمز عبور خود را وارد کنید"} 
                  {...field} 
                  disabled={isLoading}
                  className="text-right placeholder:text-right"
                  dir="rtl"
                />
              </FormControl>
              <FormMessage className="text-right" />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ورود
        </Button>
      </form>
    </Form>
  );
}