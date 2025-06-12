'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { Student, Exam } from '@prisma/client';
import { AbacusComponent } from './Abacus';
import type { ExamRow } from '../../lib/types';
import { StudentAddSubTable } from './StudentAddSubTable';
import { StudentMulDivTable } from './StudentMulDivTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface ExamWithQuestionsJson extends Exam {
  questionsJson?: string | null;
  showResult: boolean;
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

// Utility to format seconds into minutes and seconds
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  // خواندن سوالات جدید از exam
  let addSubQuestions: any[] = [];
  let mulDivQuestions: any[] = [];
  try {
    if (exam.addSubQuestions) addSubQuestions = typeof exam.addSubQuestions === 'string' ? JSON.parse(exam.addSubQuestions) : exam.addSubQuestions;
    if (exam.mulDivQuestions) {
      let tempMulDivQuestions = typeof exam.mulDivQuestions === 'string' ? JSON.parse(exam.mulDivQuestions) : exam.mulDivQuestions;
      mulDivQuestions = tempMulDivQuestions.map((q: any) => ({
        ...q,
        operators: Array.isArray(q.operators) ? q.operators.map((op: string) => {
          if (op === '*') return '×';
          if (op === '/') return '÷';
          return op; // Return as is if already '×' or '÷'
        }) : [] // Default to an empty array if q.operators is not an array
      }));
    }
  } catch (e) {
    console.error('Error parsing questions:', e);
    addSubQuestions = [];
    mulDivQuestions = [];
  }

  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const router = useRouter();
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isAutoFinished, setIsAutoFinished] = useState(false);

  // state پاسخ‌ها
  const [addSubAnswers, setAddSubAnswers] = useState<(string | number)[]>(addSubQuestions.map(() => ''));
  const [mulDivAnswers, setMulDivAnswers] = useState<(string | number)[]>(mulDivQuestions.map(() => ''));

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsAutoFinished(true);
          setFinished(true);
          // Ensure we capture the latest state before finishing
          const currentAnswers = {
            addSub: [...addSubAnswers],
            mulDiv: [...mulDivAnswers]
          };
          handleFinishExam(true, currentAnswers);
          return 0;
        }
        return prev - 1;
      });
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(currentTime);
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [finished, addSubAnswers, mulDivAnswers]);

  // ثبت آزمون
  const handleFinishExam = async (
    autoFinish = false, 
    currentAnswers?: { addSub: (string | number)[], mulDiv: (string | number)[] }
  ) => {
    if (isLoading || finished) return;
    console.log('Finishing exam - Answers:', { addSubAnswers, mulDivAnswers });
    console.log('Current answers if provided:', currentAnswers);
    
    setIsLoading(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate final time spent
    const finalTimeSpent = autoFinish ? exam.timeLimit * 60 : Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Use provided answers if available (for auto-finish) or current state
    const answersToSubmit = {
      addSub: currentAnswers?.addSub || addSubAnswers,
      mulDiv: currentAnswers?.mulDiv || mulDivAnswers
    };

    console.log('Submitting answers:', answersToSubmit);
    console.log('Time spent:', finalTimeSpent);

    try {
      const response = await fetch('/api/exams/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          studentId: student.id,
          addSubAnswers: answersToSubmit.addSub,
          mulDivAnswers: answersToSubmit.mulDiv,
          timeSpent: finalTimeSpent,
        }),
      });

      if (response.status === 409) {
        if (!autoFinish) {
          toast({
            title: 'توجه',
            description: 'شما قبلاً نتیجه این آزمون را ثبت کرده‌اید.',
            variant: 'destructive',
          });
        }
        if (exam.showResult) {
        //   router.push(`/student/exams/${exam.id}/result`);
        // } else {
          // router.push('/student/dashboard');
          // // Refresh the page after navigation
          // window.location.reload();
          setShowCompletionDialog(true);
        }
        return;
      }

      if (!response.ok) throw new Error();

      // Show completion dialog instead of toast
      setShowCompletionDialog(true);
      setIsAutoFinished(autoFinish);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'خطا',
        description: 'مشکلی در ثبت آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogAction = () => {
    if (exam.showResult) {
      router.push(`/student/exams/${exam.id}/result`);
    } else {
      router.push('/student/dashboard');
      // Refresh the page after navigation
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 items-center">
          <div className="flex flex-col items-center justify-center w-full mb-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 p-6 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg w-full max-w-md">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Clock className="h-8 w-8" />
                  <span className="text-lg font-medium">زمان باقیمانده</span>
                </div>
                <div className="text-4xl font-bold text-red-700 dark:text-red-300 tracking-wider">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {addSubQuestions.length > 0 && (
              <StudentAddSubTable
                questions={addSubQuestions}
                answers={addSubAnswers}
                setAnswers={setAddSubAnswers}
                disabled={isLoading || finished || timeLeft === 0}
              />
            )}
            {mulDivQuestions.length > 0 && (
              <StudentMulDivTable
                questions={mulDivQuestions}
                answers={mulDivAnswers}
                setAnswers={setMulDivAnswers}
                disabled={isLoading || finished || timeLeft === 0}
              />
            )}
            {/* {console.log('Rendering StudentMulDivTable with questions:', mulDivQuestions)} */}
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

      <Dialog 
        open={showCompletionDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowCompletionDialog(false);
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">
              {isAutoFinished ? 'زمان آزمون به پایان رسید' : 'آزمون با موفقیت به پایان رسید'}
            </DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative w-32 h-32">
                  <Image
                    src="/images/exam-complete.svg"
                    alt="Exam Complete"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-lg text-gray-600">
                  {isAutoFinished 
                    ? 'زمان آزمون به پایان رسید. پاسخ‌های شما با موفقیت ثبت شد.'
                    : 'پاسخ‌های شما با موفقیت ثبت شد.'}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleDialogAction}
              className="w-full max-w-md h-12 text-lg font-semibold"
              size="lg"
            >
              {exam.showResult ? 'مشاهده نتیجه' : 'بازگشت به داشبورد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 