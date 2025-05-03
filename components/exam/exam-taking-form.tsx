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

interface ExamTakingFormProps {
  exam: Exam;
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
  for (let i = 0; i < exam.rowCount; i++) {
    const items = [];
    for (let j = 0; j < exam.itemsPerRow; j++) {
      // Generate a random number with the correct digit count
      const value = randomNDigitNumber(exam.digitCount);
      // Operator is empty for the first item, random for the rest
      const operator = j === 0 ? '' : operators[Math.floor(Math.random() * operators.length)];
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

  useEffect(() => {
    setExamRows(generateExamRows(exam));
  }, [exam]);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishExam();
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

  const handleFinishExam = async () => {
    if (isLoading || finished) return;
    setIsLoading(true);
    setFinished(true);
    clearInterval(timerRef.current!);
    // محاسبه تعداد پاسخ صحیح
    const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;
    const score = Math.round((totalCorrect / examRows.length) * 100);
    try {
      const response = await fetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          studentId: student.id,
          score,
          answers: JSON.stringify(answers),
        }),
      });
      if (!response.ok) throw new Error();
      toast({
        title: 'آزمون با موفقیت ثبت شد',
        description: `نمره شما: ${score}`,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">زمان باقیمانده: {timeLeft} ثانیه</h2>
            <Button
              onClick={handleFinishExam}
              disabled={isLoading || finished}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              پایان آزمون
            </Button>
          </div>
          <CalculationsTable
            examData={examRows}
            onFinish={handleFinishExam}
            isDisabled={isLoading || finished || timeLeft === 0}
            onAnswersUpdate={handleAnswersUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
} 