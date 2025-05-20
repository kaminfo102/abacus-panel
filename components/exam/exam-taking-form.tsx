'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock } from 'lucide-react';
import { Student, Exam } from '@prisma/client';
import { CalculationsTable, Answer } from './CalculationsTable';
import { AbacusComponent } from './Abacus';
import type { ExamRow } from '../../lib/types';

interface ExamWithQuestionsJson extends Exam {
  questionsJson: string | null;
}

interface ExamTakingFormProps {
  exam: ExamWithQuestionsJson;
  student: Student;
}

// Utility to generate a random number with a specific digit count
function randomNDigitNumber(digitCount: number) {
  if (digitCount === 1) return Math.floor(Math.random() * 9) + 1;
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility to generate exam rows (questions)
function generateExamRows(exam: Exam): ExamRow[] {
  const rows: ExamRow[] = [];
  const operators = exam.operators.split(',');

  // Generate questions (columns)
  for (let questionIndex = 0; questionIndex < exam.rowCount; questionIndex++) {
    const items = [];
    
    // Generate rows for each question
    for (let rowIndex = 0; rowIndex < exam.itemsPerRow; rowIndex++) {
      // Generate a random number with the specified digit count
      const value = randomNDigitNumber(exam.digitCount);
      // Operator is empty for the first item, random for the rest
      const operator = rowIndex === 0 ? '' : operators[Math.floor(Math.random() * operators.length)];
      items.push({ value: value.toString(), operator });
    }
    
    rows.push({ items });
  }
  return rows;
}

export function ExamTakingForm({ exam, student }: ExamTakingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit);
  const [examRows, setExamRows] = useState<ExamRow[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: Answer }>({});
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAutoFinished, setIsAutoFinished] = useState(false);

  // Parse and validate exam questions
  useEffect(() => {
    try {
      let parsedRows: ExamRow[];
      if (exam.questionsJson) {
        parsedRows = JSON.parse(exam.questionsJson);
        // Validate the parsed rows
        if (!Array.isArray(parsedRows) || parsedRows.length !== exam.rowCount) {
          throw new Error('Invalid questions format');
        }
        for (const row of parsedRows) {
          if (!row.items || !Array.isArray(row.items) || row.items.length !== exam.itemsPerRow) {
            throw new Error('Invalid items format in questions');
          }
        }
      } else {
        parsedRows = generateExamRows(exam);
      }
      setExamRows(parsedRows);
    } catch (e) {
      console.error('Failed to parse questionsJson:', e);
      toast({
        title: 'خطا',
        description: 'مشکلی در بارگذاری سوالات رخ داده است.',
        variant: 'destructive',
      });
      router.push('/student/exams');
    }
  }, [exam, router]);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsAutoFinished(true);
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
      // Update time spent every second
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [finished, startTime]);

  const handleAnswersUpdate = (newAnswers: { [key: number]: Answer }) => {
    setAnswers(newAnswers);
  };

  const handleFinishExam = async (autoFinish = false) => {
    if (isLoading || finished) return;
    setIsLoading(true);
    setFinished(true);
    clearInterval(timerRef.current!);
    
    // Calculate final time spent in seconds
    const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // محاسبه تعداد پاسخ صحیح
    const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;
    if (!examRows || examRows.length === 0) {
      toast({
        title: 'خطا',
        description: 'مشکلی در محاسبه نمره رخ داده است.',
        variant: 'destructive',
      });
      return;
    }
    const score = Math.round((totalCorrect / examRows.length) * 100);

    // تبدیل پاسخ‌ها به فرمت صحیح با ایندکس‌های درست
    const formattedAnswers = Object.entries(answers).reduce((acc, [key, value]) => {
      // تبدیل کلید به عدد و کم کردن 1 برای تطابق با ایندکس آرایه
      const index = parseInt(key) - 1;
      acc[index] = value;
      return acc;
    }, {} as { [key: number]: Answer });

    try {
      const response = await fetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          studentId: student.id,
          score,
          answers: JSON.stringify(formattedAnswers),
          timeSpent: finalTimeSpent,
        }),
      });
      if (response.status === 409) {
        toast({
          title: 'توجه',
          description: 'شما قبلاً نتیجه این آزمون را ثبت کرده‌اید.',
          variant: 'destructive',
        });
        router.push(`/student/exams/${exam.id}/result`);
        return;
      }
      if (!response.ok) throw new Error();
      toast({
        title: autoFinish ? 'زمان آزمون به پایان رسید' : 'آزمون با موفقیت ثبت شد',
        description: autoFinish
          ? 'زمان شما به پایان رسید. نتیجه آزمون ثبت شد.'
          : `نمره شما: ${score}`,
      });
      router.push(`/student/exams/${exam.id}/result`);
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در ثبت آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fix for CalculationsTable onFinish prop
  const handleTableFinish = (correctAnswers: number) => {
    handleFinishExam(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 items-center">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
            <div className="flex justify-center w-full">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 px-6 py-3 rounded-lg border border-red-200 dark:border-red-800">
                <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  زمان باقیمانده: {timeLeft} ثانیه
                </h2>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            
            <CalculationsTable
              examData={examRows}
              onFinish={handleTableFinish}
              isDisabled={isLoading || finished || timeLeft === 0}
              onAnswersUpdate={handleAnswersUpdate}
              examTitle={exam.title}
              isManual={exam.isManual || exam.creationMode === 'manual'}
            />
          </div>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button
              onClick={() => handleFinishExam(false)}
              disabled={isLoading || finished || timeLeft === 0}
              className="w-full max-w-md h-12 text-lg font-semibold"
              size="lg"
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              پایان آزمون
            </Button>
          </div>
        </CardContent>
      </Card>
      <AbacusComponent />
    </div>
  );
} 