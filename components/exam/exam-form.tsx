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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';

const formSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  digitCount: z.coerce.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.coerce.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.coerce.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.coerce.number().min(1, 'حداقل زمان 1 دقیقه باید باشد'),
  operators: z.string().min(1, 'حداقل یک عملگر باید انتخاب شود'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
  creationMode: z.enum(['automatic', 'manual'], {
    required_error: 'لطفا نحوه ایجاد آزمون را انتخاب کنید',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExamFormProps {
  initialData?: FormValues & { id: string };
}

export function ExamForm({ initialData }: ExamFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<ExamRow[]>([]);
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
      creationMode: 'automatic',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (values.creationMode === 'manual' && manualQuestions.length === 0) {
      setShowManualInput(true);
      return;
    }

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
        questionsJson: values.creationMode === 'manual' ? JSON.stringify(manualQuestions) : null,
        isManual: values.creationMode === 'manual',
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
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
      console.error('Error creating exam:', error);
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
    const newOperators = settings.operators.includes(operator)
      ? settings.operators.filter(op => op !== operator)
      : [...settings.operators, operator];
    
    setSettings(prev => ({...prev, operators: newOperators}));
    form.setValue('operators', newOperators.join(','));
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

  const ManualQuestionInput = () => {
    const values = form.getValues();
    const [questions, setQuestions] = useState<ExamRow[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
      // Initialize empty questions array
      const initialQuestions: ExamRow[] = Array(values.rowCount).fill(null).map(() => ({
        items: Array(values.itemsPerRow).fill(null).map(() => ({ value: '', operator: '' }))
      }));
      setQuestions(initialQuestions);
      setError('');
    }, [values.rowCount, values.itemsPerRow]);

    const handleValueChange = (rowIndex: number, colIndex: number, value: string) => {
      // Remove leading zeros
      value = value.replace(/^0+/, '');
      
      if (value.length > values.digitCount) {
        setError(`تعداد ارقام باید حداکثر ${values.digitCount} باشد.`);
        return;
      }
      setError('');
      const newQuestions = [...questions];
      newQuestions[rowIndex].items[colIndex].value = value;
      setQuestions(newQuestions);
    };

    const handleOperatorChange = (rowIndex: number, colIndex: number, operator: string) => {
      setError('');
      const newQuestions = [...questions];
      newQuestions[rowIndex].items[colIndex].operator = operator;
      setQuestions(newQuestions);
    };

    const handleSaveQuestions = () => {
      // Validate all questions
      for (let i = 0; i < questions.length; i++) {
        const row = questions[i];
        for (let j = 0; j < row.items.length; j++) {
          const item = row.items[j];
          if (!item.value) {
            setError(`لطفا تمام اعداد را در سوال ${i + 1} وارد کنید.`);
            return;
          }
          if (j < row.items.length - 1 && !item.operator) {
            setError(`لطفا عملگر بین اعداد در سوال ${i + 1} را وارد کنید.`);
            return;
          }
        }
      }

      // Ensure operators are in the correct positions
      const validatedQuestions = questions.map(row => ({
        items: row.items.map((item, index) => ({
          value: item.value,
          operator: index < row.items.length - 1 ? item.operator : ''
        }))
      }));

      setManualQuestions(validatedQuestions);
      setShowManualInput(false);
      toast({
        title: 'سوالات ذخیره شدند',
        description: 'سوالات با موفقیت ذخیره شدند. می‌توانید آزمون را ایجاد کنید.',
      });
    };

    const operatorOptions = settings.operators;

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">ورود سوالات به صورت دستی</h1>
              <p className="text-muted-foreground">
                لطفا {values.rowCount} سوال را با {values.itemsPerRow} عدد و عملگر وارد کنید.
                <br />
                <span className="text-sm">
                  تعداد ارقام مجاز: {values.digitCount}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table className="border border-gray-300">
                  <TableHeader>
                    <TableRow className="bg-primary/10 border-b border-gray-300">
                      {Array(values.rowCount).fill(null).map((_, i) => (
                        <TableHead key={i} className="text-center font-bold border-x border-gray-300">
                          {values.rowCount - i}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-bold border-l border-gray-300">شماره</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(values.itemsPerRow).fill(null).map((_, itemIndex) => (
                      <TableRow key={itemIndex} className="border-b border-gray-300">
                        {questions.map((row, rowIndex) => (
                          <TableCell
                            key={rowIndex}
                            className="text-center border-x border-gray-300"
                          >
                            <div className="flex flex-col items-center gap-1">
                              {itemIndex === 0 ? (
                                <Input
                                  type="number"
                                  value={row.items[itemIndex].value}
                                  onChange={(e) => handleValueChange(rowIndex, itemIndex, e.target.value)}
                                  className="w-20 text-center font-mono"
                                  maxLength={values.digitCount}
                                  placeholder="عدد"
                                />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <select
                                    className="border rounded px-1 py-0.5 bg-white font-mono w-20 text-center"
                                    value={row.items[itemIndex - 1].operator}
                                    onChange={(e) => handleOperatorChange(rowIndex, itemIndex - 1, e.target.value)}
                                  >
                                    <option value="">انتخاب</option>
                                    {operatorOptions.map((op) => (
                                      <option key={op} value={op}>{OPERATOR_LABELS[op] || op}</option>
                                    ))}
                                  </select>
                                  <Input
                                    type="number"
                                    value={row.items[itemIndex].value}
                                    onChange={(e) => handleValueChange(rowIndex, itemIndex, e.target.value)}
                                    className="w-20 text-center font-mono"
                                    maxLength={values.digitCount}
                                    placeholder="عدد"
                                  />
                                </div>
                              )}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-center border-l border-gray-300 font-mono">
                          {itemIndex + 1}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-md border border-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="outline" onClick={() => setShowManualInput(false)}>
                انصراف
              </Button>
              <Button onClick={handleSaveQuestions}>
                ذخیره سوالات
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showManualInput ? (
        <ManualQuestionInput />
      ) : (
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

                  <FormField
                    control={form.control}
                    name="creationMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نحوه ایجاد آزمون</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="نحوه ایجاد آزمون را انتخاب کنید" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automatic">اتوماتیک</SelectItem>
                            <SelectItem value="manual">دستی</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          در حالت اتوماتیک، سوالات به صورت تصادفی ایجاد می‌شوند. در حالت دستی، شما باید سوالات را خودتان وارد کنید.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  
                </div>
                
                
                

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
      )}
    </>
  );
}