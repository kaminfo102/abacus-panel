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
    const [currentItems, setCurrentItems] = useState<{ value: string; operator: string }[]>([]);
    const [currentOperator, setCurrentOperator] = useState('');
    const [error, setError] = useState('');
    const [currentNumber, setCurrentNumber] = useState('');

    useEffect(() => {
      setCurrentItems([]);
      setCurrentOperator('');
      setError('');
      setCurrentNumber('');
    }, [values.itemsPerRow, values.digitCount, showManualInput]);

    const handleAddNumber = (value: string) => {
      // Remove leading zeros
      value = value.replace(/^0+/, '');
      
      if (value.length === 0) {
        setError('لطفا یک عدد وارد کنید.');
        return;
      }

      // Validate digit count
      if (value.length > values.digitCount) {
        setError(`تعداد ارقام باید حداکثر ${values.digitCount} باشد.`);
        return;
      }

      // Validate item count
      if (currentItems.length >= values.itemsPerRow) {
        setError(`تعداد آیتم‌ها نمی‌تواند بیشتر از ${values.itemsPerRow} باشد.`);
        return;
      }

      // Validate operator requirement
      if (currentItems.length > 0 && !currentOperator) {
        setError('ابتدا عملگر را انتخاب کنید.');
        return;
      }

      setError('');
      setCurrentItems((prev) => [
        ...prev,
        { value, operator: prev.length === 0 ? '' : currentOperator }
      ]);
      setCurrentOperator('');
      setCurrentNumber('');
    };

    const handleOperatorChange = (op: string) => {
      if (currentItems.length >= values.itemsPerRow - 1) {
        setError('تعداد آیتم‌ها کامل است.');
        return;
      }
      if (currentItems.length === 0) {
        setError('ابتدا باید یک عدد وارد کنید.');
        return;
      }
      setCurrentOperator(op);
      setError('');
    };

    const handleRemoveLast = () => {
      setCurrentItems((prev) => prev.slice(0, -1));
      setCurrentOperator('');
      setError('');
    };

    const handleAddQuestion = () => {
      if (currentItems.length !== values.itemsPerRow) {
        setError(`تعداد آیتم‌ها باید دقیقاً ${values.itemsPerRow} باشد.`);
        return;
      }
      if (manualQuestions.length >= values.rowCount) {
        setError(`تعداد سوالات نمی‌تواند بیشتر از ${values.rowCount} باشد.`);
        return;
      }
      setManualQuestions([...manualQuestions, { items: currentItems }]);
      setCurrentItems([]);
      setCurrentOperator('');
      setError('');
      setCurrentNumber('');
    };

    const handleSaveQuestions = () => {
      if (manualQuestions.length !== values.rowCount) {
        setError(`لطفا دقیقاً ${values.rowCount} سوال را وارد کنید.`);
        return;
      }
      setShowManualInput(false);
    };

    const operatorOptions = settings.operators;

    return (
      <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>ورود سوالات به صورت دستی</DialogTitle>
            <DialogDescription>
              لطفا {values.rowCount} سوال را با {values.itemsPerRow} عدد و عملگر وارد کنید.
              <br />
              <span className="text-sm text-muted-foreground">
                تعداد ارقام مجاز: {values.digitCount}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">
                سوال فعلی ({manualQuestions.length + 1}/{values.rowCount})
                <span className="text-sm text-muted-foreground mr-2">
                  - آیتم‌ها: {currentItems.length}/{values.itemsPerRow}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {currentItems.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-slate-100 rounded text-base font-mono">{item.value}</span>
                    {idx < values.itemsPerRow - 1 && idx !== values.itemsPerRow - 1 && (
                      <span className="px-1 text-lg font-bold">{item.operator}</span>
                    )}
                  </span>
                ))}
                {currentItems.length < values.itemsPerRow && (
                  <>
                    {currentItems.length > 0 && (
                      <select
                        className="border rounded px-2 py-1 mx-1"
                        value={currentOperator}
                        onChange={(e) => handleOperatorChange(e.target.value)}
                      >
                        <option value="">انتخاب عملگر</option>
                        {operatorOptions.map((op) => (
                          <option key={op} value={op}>{OPERATOR_LABELS[op] || op}</option>
                        ))}
                      </select>
                    )}
                    <Input
                      type="number"
                      placeholder="عدد را وارد کنید"
                      maxLength={values.digitCount}
                      className="w-24"
                      value={currentNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= values.digitCount) {
                          setCurrentNumber(val);
                          setError('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNumber(currentNumber);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddNumber(currentNumber)}
                      disabled={!currentNumber || (currentItems.length > 0 && !currentOperator)}
                    >
                      افزودن عدد
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveLast} 
                      disabled={currentItems.length === 0}
                    >
                      حذف آخرین
                    </Button>
                  </>
                )}
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              <Button 
                type="button" 
                onClick={handleAddQuestion} 
                disabled={currentItems.length !== values.itemsPerRow || manualQuestions.length >= values.rowCount} 
                className="mt-2"
              >
                افزودن سوال
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">سوالات وارد شده ({manualQuestions.length}/{values.rowCount})</h3>
              {manualQuestions.map((question, index) => (
                <div key={index} className="p-2 bg-muted rounded-md">
                  {question.items.map((item, itemIndex) => (
                    <span key={itemIndex}>
                      {item.value}
                      {itemIndex < question.items.length - 1 && ` ${item.operator} `}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualInput(false)}>
              انصراف
            </Button>
            <Button 
              onClick={handleSaveQuestions}
              disabled={manualQuestions.length !== values.rowCount}
            >
              ذخیره سوالات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
      <ManualQuestionInput />
    </Card>
  );
}