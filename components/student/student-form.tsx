'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Student, User } from '@prisma/client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { KURDISTAN_CITIES, STUDENT_TERMS } from '@/lib/constants';

const studentSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  nationalId: z.string().length(10, 'کد ملی باید ۱۰ رقم باشد'),
  dateOfBirth: z.string().optional(),
  mobileNumber: z.string().length(11, 'شماره موبایل باید ۱۱ رقم باشد'),
  city: z.string().min(1, 'شهرستان الزامی است'),
  term: z.string().min(1, 'ترم الزامی است'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student & { user: User };
}

export function StudentForm({ student }: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: student?.firstName ?? '',
      lastName: student?.lastName ?? '',
      nationalId: student?.nationalId ?? '',
      dateOfBirth: student?.dateOfBirth ?? '',
      mobileNumber: student?.mobileNumber ?? '',
      city: student?.city ?? '',
      term: student?.term ?? '',
    },
  });

  const onSubmit = async (values: StudentFormValues) => {
    setIsLoading(true);

    try {
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const method = student ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(student ? 'مشکلی در ویرایش دانش‌آموز رخ داده است' : 'مشکلی در ایجاد دانش‌آموز رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: student ? 'اطلاعات دانش‌آموز با موفقیت ویرایش شد.' : 'دانش‌آموز با موفقیت ایجاد شد.',
      });

      router.push('/admin/students');
      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: student ? 'مشکلی در ویرایش دانش‌آموز رخ داده است.' : 'مشکلی در ایجاد دانش‌آموز رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام خانوادگی</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد ملی</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شماره تماس</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاریخ تولد</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شهرستان</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="شهرستان را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {KURDISTAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ترم</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ترم را انتخاب کنید" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STUDENT_TERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            ذخیره تغییرات
          </Button>
        </div>
      </form>
    </Form>
  );
}