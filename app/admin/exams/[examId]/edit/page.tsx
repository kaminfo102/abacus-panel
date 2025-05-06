'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/inputNum';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calculator, Clock, Grid, Hash, Info, ListChecks, Type } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STUDENT_TERMS } from '@/lib/constants';
import { CheckboxM } from '@/components/ui/checkboxM';
import { Label } from '@/components/ui/label';
import { OPERATOR_LABELS } from '@/types/constants';
import type { ExamSettings, Operator } from "@/types/exam";

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'عنوان آزمون باید حداقل 2 کاراکتر باشد.',
  }),
  digitCount: z.coerce.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.coerce.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.coerce.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.coerce.number().min(1, 'حداقل زمان 1 دقیقه باید باشد'),
  operators: z.string().min(1, 'حداقل یک عملگر باید انتخاب شود'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
});

interface ExamEditPageProps {
  params: {
    examId: string;
  };
}

export default function ExamEditPage({ params }: ExamEditPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      digitCount: 1,
      rowCount: 1,
      itemsPerRow: 1,
      timeLimit: 1,
      operators: '+',
      term: '',
    },
  });

  const [settings, setSettings] = useState<ExamSettings>({
    digitCount: 1,
    rowCount: 10,
    timeLimit: 60,
    operators: ['+', '-'],
    itemsPerRow: 2
  });

  const LIMITS = {
    digitCount: { min: 1, max: 5 },
    rowCount: { min: 5, max: 20 },
    timeLimit: { min: 1 },
    itemsPerRow: { min: 2, max: 10 }
  };

  const updateSetting = <K extends keyof ExamSettings>(
    key: K,
    value: ExamSettings[K]
  ) => {
    setSettings(prev => ({...prev, [key]: value }));
  };

  const toggleOperator = (operator: Operator) => {
    setSettings(prev => ({
      ...prev,
      operators: prev.operators.includes(operator)
        ? prev.operators.filter(op => op !== operator)
        : [...prev.operators, operator]
    }));
  };

  const GuideItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-2 text-sm">
      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${params.examId}`);
        if (!response.ok) throw new Error();
        const exam = await response.json();
        
        const operators = exam.operators.split(',');
        
        form.reset({
          title: exam.title,
          digitCount: exam.digitCount,
          rowCount: exam.rowCount,
          itemsPerRow: exam.itemsPerRow,
          timeLimit: Math.floor(exam.timeLimit / 60),
          operators: exam.operators,
          term: exam.term,
        });

        setSettings({
          digitCount: exam.digitCount,
          rowCount: exam.rowCount,
          timeLimit: exam.timeLimit,
          operators: operators,
          itemsPerRow: exam.itemsPerRow
        });
      } catch (error) {
        toast({
          title: 'خطا',
          description: 'مشکلی در دریافت اطلاعات آزمون رخ داده است.',
          variant: 'destructive',
        });
        router.push('/admin/exams');
      }
    };

    fetchExam();
  }, [params.examId, form, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exams/${params.examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          operators: settings.operators.join(','),
          timeLimit: values.timeLimit * 60,
        }),
      });

      if (!response.ok) throw new Error();

      toast({
        title: 'موفقیت‌آمیز',
        description: 'آزمون با موفقیت ویرایش شد.',
      });

      router.push('/admin/exams');
      router.refresh();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در ویرایش آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ویرایش آزمون</h1>
          <p className="text-muted-foreground">
            اطلاعات آزمون را ویرایش کنید.
          </p>
        </div>

        <Card className="p-4 md:p-8 max-w-4xl mx-auto">
          <CardContent>
            {/* راهنمای تکمیل فرم */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 mb-6 md:mb-8">
              <h3 className="font-semibold text-blue-700 mb-2 md:mb-3 text-sm md:text-base">راهنمای تکمیل فرم</h3>
              <ul className="space-y-1.5 md:space-y-2 text-blue-600 text-xs md:text-sm">
                <GuideItem text="تعداد ارقام: تعیین کننده حداکثر رقم‌های اعداد در محاسبات" />
                <GuideItem text="تعداد سوال: مشخص کننده تعداد کل سوالات آزمون" />
                <GuideItem text="تعداد آیتم: تعداد اعداد در هر سطر برای محاسبه" />
                <GuideItem text="مدت زمان: زمان کل آزمون به دقیقه" />
              </ul>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
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
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">ترم</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-right [&>span]:text-right">
                              <SelectValue placeholder="ترم را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-right">
                            {STUDENT_TERMS.map((term) => (
                              <SelectItem key={term} value={term} className="text-right">
                                {term}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs md:text-sm">
                          آزمون برای دانش‌آموزان این ترم قابل مشاهده خواهد بود
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="digitCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                            <Hash className="h-4 w-4" />
                            تعداد ارقام
                          </FormLabel>
                          <FormControl>
                            <NumberInput value={field.value} onChange={field.onChange} min={1} max={999999} step={1} />
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
                          <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                            <ListChecks className="h-4 w-4" />
                            تعداد سوال
                          </FormLabel>
                          <FormControl>
                            <NumberInput value={field.value} onChange={field.onChange} min={1} max={999999} step={1} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="itemsPerRow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                            <Grid className="h-4 w-4" />
                            تعداد آیتم در هر سوال
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              value={field.value}
                              onChange={field.onChange}
                              min={LIMITS.itemsPerRow.min}
                              max={LIMITS.itemsPerRow.max}
                              step={1}
                              className="w-full"
                            />
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
                          <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                            <Clock className="h-4 w-4" />
                            محدودیت زمانی (دقیقه)
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              id="timeLimit"
                              value={field.value}
                              onChange={(e) => {
                                const value = parseInt(e.toString());
                                field.onChange(value);
                                updateSetting('timeLimit', value * 60);
                              }}
                              min={LIMITS.timeLimit.min}
                              step={1}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="text-xs md:text-sm">
                            حداقل زمان: 1 دقیقه
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="operators"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                          <Calculator className="h-4 w-4" />
                          عملگرها
                        </FormLabel>
                        <FormControl>
                          <div className="bg-slate-50 p-3 md:p-6 rounded-xl">
                            <h3 className="font-semibold text-base md:text-lg text-slate-700 mb-3 md:mb-4">عملگرهای مجاز</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                              {(['+', '-', '*', '/'] as Operator[]).map((op) => (
                                <div key={op} className="flex items-center gap-3 bg-white p-2 md:p-3 rounded-lg shadow-sm">
                                  <CheckboxM
                                    id={`op-${op}`}
                                    checked={settings.operators.includes(op)}
                                    onCheckedChange={() => toggleOperator(op)}
                                  />
                                  <Label
                                    htmlFor={`op-${op}`}
                                    className="text-xs md:text-sm font-medium cursor-pointer"
                                  >
                                    {OPERATOR_LABELS[op]}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-end">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base"
                  >
                    انصراف
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base"
                  >
                    {isLoading && <Loader2 className="ml-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />}
                    بروزرسانی آزمون
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 