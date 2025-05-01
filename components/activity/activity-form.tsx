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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  count: z.coerce.number().min(1, 'تعداد باید حداقل 1 باشد'),
  date: z.string().min(1, 'تاریخ الزامی است'),
  completionTime: z.string().min(1, 'زمان انجام الزامی است'),
  score: z.coerce.number().min(1, 'امتیاز باید حداقل 1 باشد'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
});

type FormValues = z.infer<typeof formSchema>;

interface ActivityFormProps {
  initialData?: FormValues & { id: string };
}

export function ActivityForm({ initialData }: ActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      count: 1,
      date: '',
      completionTime: '',
      score: 1,
      term: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/activities/${initialData.id}` 
        : '/api/activities';
      
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
        title: isEditing ? 'فعالیت بروزرسانی شد' : 'فعالیت جدید ایجاد شد',
        description: isEditing 
          ? 'اطلاعات فعالیت با موفقیت بروزرسانی شد.' 
          : 'فعالیت جدید با موفقیت به سیستم اضافه شد.',
      });

      router.push('/admin/activities');
      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: isEditing 
          ? 'مشکلی در بروزرسانی اطلاعات فعالیت رخ داده است.' 
          : 'مشکلی در ایجاد فعالیت جدید رخ داده است.',
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
                    <FormLabel>عنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان فعالیت را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تعداد</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="تعداد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 1401/06/15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>زمان انجام</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 2 ساعت" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>امتیاز</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="امتیاز" {...field} />
                    </FormControl>
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
                      فعالیت برای دانش‌آموزان این ترم قابل مشاهده خواهد بود
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
                {isEditing ? 'بروزرسانی فعالیت' : 'ایجاد فعالیت'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}