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
        ? { identifier: (values as { nationalId: string }).nationalId, password: values.password, role: 'STUDENT' }
        : { identifier: (values as { email: string }).email, password: values.password, role: 'ADMIN' };

      const result = await signIn('credentials', {
        ...loginData,
        redirect: false
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

      toast({
        title: "ورود موفق",
        description: "به سامانه مدیریت دانش‌آموزان خوش آمدید.",
      });

      if (isStudent) {
        router.push('/student/dashboard');
      } else {
        router.push('/admin/dashboard');
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
                <FormLabel>کد ملی</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="کد ملی خود را وارد کنید" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="ایمیل خود را وارد کنید" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isStudent ? 'شماره موبایل' : 'رمز عبور'}</FormLabel>
              <FormControl>
                <Input 
                  type={isStudent ? "text" : "password"} 
                  placeholder={isStudent ? "شماره موبایل خود را وارد کنید" : "رمز عبور خود را وارد کنید"} 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
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