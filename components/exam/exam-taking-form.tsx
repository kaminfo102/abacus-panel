'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Student, Exam } from '@prisma/client';
import { CalculationsTable, Answer } from './CalculationsTable';
import type { ExamRow } from '../../lib/types';

interface ExamWithQuestionsJson extends Exam {
  questionsJson?: string;
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
  // Debug: log questionsJson and parsed examRows
  let parsedRows: ExamRow[] = [];
  try {
    parsedRows = exam.questionsJson ? JSON.parse(exam.questionsJson) : [];
  } catch (e) {
    console.error('Failed to parse questionsJson:', e, exam.questionsJson);
    parsedRows = [];
  }
  console.log('questionsJson:', exam.questionsJson);
  console.log('parsed examRows:', parsedRows);

  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit);
  const [examRows, setExamRows] = useState<ExamRow[]>(parsedRows);
  const [answers, setAnswers] = useState<{ [key: number]: Answer }>({});
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    try {
      if (exam.questionsJson) {
        setExamRows(JSON.parse(exam.questionsJson));
      }
    } catch (e) {
      setExamRows([]);
      console.error('Failed to parse questionsJson in useEffect:', e, exam.questionsJson);
    }
  }, [exam.questionsJson]);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [finished]);

  const handleAnswersUpdate = (newAnswers: { [key: number]: Answer }) => {
    setAnswers(newAnswers);
  };

  const handleFinishExam = async (autoFinish = false) => {
    if (isLoading || finished) return;
    setIsLoading(true);
    setFinished(true);
    clearInterval(timerRef.current!);
    // محاسبه تعداد پاسخ صحیح
    const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;
    const score = Math.round((totalCorrect / examRows.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
    try {
      const response = await fetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          studentId: student.id,
          score,
          answers: JSON.stringify(answers),
          timeSpent,
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
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">زمان باقیمانده: {timeLeft} ثانیه</h2>
            <Button
              onClick={() => handleFinishExam(false)}
              disabled={isLoading || finished}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              پایان آزمون
            </Button>
          </div>
          <CalculationsTable
            examData={examRows}
            onFinish={handleTableFinish}
            isDisabled={isLoading || finished || timeLeft === 0}
            onAnswersUpdate={handleAnswersUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
} 