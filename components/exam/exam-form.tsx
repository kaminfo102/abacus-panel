'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/inputNum';
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
import { Calculator, Clock, Grid, Hash, Info, ListChecks, Type } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { ExamSettings, Operator } from "@/types/exam";
import { CheckboxM } from '../ui/checkboxM';
import { Label } from '../ui/label';
import { OPERATOR_LABELS } from '@/types/constants';
import { AddSubQuestionsTable } from './AddSubQuestionsTable';
import { MulDivQuestionsTable } from './MulDivQuestionsTable';

const formSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  digitCount: z.coerce.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.coerce.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.coerce.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.coerce.number().min(1, 'حداقل زمان 1 دقیقه باید باشد'),
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
      timeLimit: 1,
      operators: '+',
      term: '',
    },
  });

  const [addSubQuestions, setAddSubQuestions] = useState([
    { numbers: [0, 0], answer: '' }
  ]);

  const [mulDivQuestions, setMulDivQuestions] = useState([
    { left: 0, right: 0, answer: '' }
  ]);

  const rowCount = form.watch('rowCount');
  const itemsPerRow = form.watch('itemsPerRow');

  useEffect(() => {
    setAddSubQuestions(prev => {
      const newQuestions = [];
      for (let i = 0; i < rowCount; i++) {
        const prevQ = prev[i] || {};
        const numbers = Array.from({ length: itemsPerRow }, (_, j) => prevQ.numbers && prevQ.numbers[j] !== undefined ? prevQ.numbers[j] : 0);
        newQuestions.push({
          numbers,
          answer: prevQ.answer ?? ''
        });
      }
      return newQuestions;
    });
    setMulDivQuestions(prev => {
      const newQuestions = [];
      for (let i = 0; i < rowCount; i++) {
        const prevQ = prev[i] || {};
        const numbers = Array.from({ length: itemsPerRow }, (_, j) => prevQ.numbers && prevQ.numbers[j] !== undefined ? prevQ.numbers[j] : 0);
        const operators = Array.from({ length: Math.max(itemsPerRow - 1, 1) }, (_, j) => prevQ.operators && prevQ.operators[j] ? prevQ.operators[j] : '×');
        newQuestions.push({
          numbers,
          operators,
          answer: prevQ.answer ?? ''
        });
      }
      return newQuestions;
    });
  }, [rowCount, itemsPerRow]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const url = isEditing 
        ? `/api/exams/${initialData.id}` 
        : '/api/exams';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const formData = {
        ...values,
        operators: settings.operators.join(','),
        timeLimit: values.timeLimit * 60,
        addSubQuestions: settings.operators.some(op => op === '+' || op === '-') ? addSubQuestions : undefined,
        mulDivQuestions: settings.operators.some(op => op === '*' || op === '/') ? mulDivQuestions : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  const updateSetting = <K extends keyof ExamSettings>(
    key: K,
    value: ExamSettings[K]
  ) => {
    setSettings(prev => ({...prev, [key]: value }));
  };

  const GuideItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-2 text-sm">
      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );

  const DEFAULT_SETTINGS: ExamSettings = {
    digitCount: 1,
    rowCount: 10,
    timeLimit: 60,
    operators: [`+`,`-`],
    itemsPerRow: 2
  };

  const toggleOperator = (operator: Operator) => {
    setSettings(prev => ({...prev,
        operators: prev.operators.includes(operator)
        ? prev.operators.filter(op => op !== operator)
        : [...prev.operators, operator]
        }));
  };

  const [settings, setSettings] = useState<ExamSettings>(DEFAULT_SETTINGS);

  interface ExamSettingsProps {
    onStart: (settings: ExamSettings) => void;
  }

  const LIMITS = {
    digitCount: { min: 1, max: 5 },
    rowCount: { min: 5, max: 20 },
    timeLimit: { min: 1 },
    itemsPerRow: { min: 2, max: 10 }
  };

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      {/* راهنمای تکمیل فرم */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-blue-700 mb-3">راهنمای تکمیل فرم</h3>
          <ul className="space-y-2 text-blue-600">
            <GuideItem text="تعداد ارقام: تعیین کننده حداکثر رقم‌های اعداد در محاسبات" />
            <GuideItem text="تعداد سوال: مشخص کننده تعداد کل سوالات آزمون" />
            <GuideItem text="تعداد آیتم: تعداد اعداد در هر سطر برای محاسبه" />
            <GuideItem text="مدت زمان: زمان کل آزمون به دقیقه" />
          </ul>
        </div>
      <CardContent className="pt-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
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
                              name="term"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ترم</FormLabel>
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
                                  <FormDescription>
                                    آزمون برای دانش‌آموزان این ترم قابل مشاهده خواهد بود
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
          </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              

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
                    <FormLabel className="flex items-center gap-2">
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

              <FormField
                control={form.control}
                name="itemsPerRow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
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
                        className="w-full min-w-[120px]"
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
                    <FormLabel className="flex items-center gap-2">
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
                        className="w-full min-w-[120px]"
                      />
                    </FormControl>
                    <FormDescription>
                      حداقل زمان: 1 دقیقه
                    </FormDescription>
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
                       {/* بخش چک‌باکس‌ها */}
                        <div className="bg-slate-50 p-6 rounded-xl">
                            <h3 className="font-semibold text-lg text-slate-700 mb-4">عملگرهای مجاز</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {(['+', '-', '*', '/'] as Operator[]).map((op) => (
                                    <div key={op} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                                        <CheckboxM
                                            id={`op-${op}`}
                                            checked={settings.operators.includes(op)}
                                            onCheckedChange={() => toggleOperator(op)}
                                        />
                                        <Label
                                            htmlFor={`op-${op}`}
                                            className="text-sm font-medium cursor-pointer"
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
            
            
            

            {/* جدول جمع/تفریق */}
            {settings.operators.some(op => op === '+' || op === '-') && (
              <AddSubQuestionsTable
                questions={addSubQuestions}
                setQuestions={setAddSubQuestions}
                active={true}
              />
            )}
            {/* جدول ضرب/تقسیم */}
            {settings.operators.some(op => op === '*' || op === '/') && (
              <MulDivQuestionsTable
                questions={mulDivQuestions}
                setQuestions={setMulDivQuestions}
                active={true}
              />
            )}

            <div className="flex justify-end gap-4 mt-8 w-full ">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                disabled={isLoading}
                className="h-12 px-8 text-lg"
              >
                انصراف
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-12 px-8 text-lg"
              >
                {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                {isEditing ? 'بروزرسانی آزمون' : 'ایجاد آزمون'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}