'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { STUDENT_TERMS } from '@/lib/constants';
import { Calculator, Clock, Grid, Hash, ListChecks, Type } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  digitCount: z.coerce.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.coerce.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.coerce.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.coerce.number().min(30, 'حداقل زمان 30 ثانیه باید باشد'),
  operators: z.string().min(1, 'حداقل یک عملگر باید انتخاب شود'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
});

type FormValues = z.infer<typeof formSchema>;

interface ExamFormProps {
  initialData?: FormValues & { id: string };
}

export function ExamForm({ initialData }: ExamFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      digitCount: 1,
      rowCount: 1,
      itemsPerRow: 1,
      timeLimit: 30,
      operators: '+',
      term: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/exams/${initialData.id}` 
        : '/api/exams';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast({
        title: isEditing ? 'آزمون بروزرسانی شد' : 'آزمون جدید ایجاد شد',
        description: isEditing 
          ? 'اطلاعات آزمون با موفقیت بروزرسانی شد.' 
          : 'آزمون جدید با موفقیت به سیستم اضافه شد.',
      });

      router.push('/admin/exams');
      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: isEditing 
          ? 'مشکلی در بروزرسانی اطلاعات آزمون رخ داده است.' 
          : 'مشکلی در ایجاد آزمون جدید رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      عنوان
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان آزمون را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="digitCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      تعداد ارقام
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="تعداد ارقام" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rowCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      تعداد ردیف
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="تعداد ردیف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemsPerRow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      تعداد آیتم در هر ردیف
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="تعداد آیتم در هر ردیف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      محدودیت زمانی (ثانیه)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="30" placeholder="محدودیت زمانی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      عملگرها
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: +,-,*" {...field} />
                    </FormControl>
                    <FormDescription>
                      عملگرها را با کاما از هم جدا کنید
                    </FormDescription>
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
                    <FormDescription>
                      آزمون برای دانش‌آموزان این ترم قابل مشاهده خواهد بود
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'بروزرسانی آزمون' : 'ایجاد آزمون'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}