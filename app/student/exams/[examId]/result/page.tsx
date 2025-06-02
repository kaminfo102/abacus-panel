import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import React from 'react';

interface ExamResultPageProps {
  params: {
    examId: string;
  };
}

export default async function ExamResultPage({ params }: ExamResultPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'STUDENT' || !session.user.studentId) {
    redirect('/');
  }

  const student = await db.student.findUnique({
    where: { id: session.user.studentId },
  });

  if (!student) {
    redirect('/');
  }

  const exam = await db.exam.findUnique({
    where: { id: params.examId },
  });

  if (!exam || exam.term !== student.term) {
    redirect('/student/exams');
  }

  const result = await db.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: exam.id,
        studentId: student.id,
      },
    },
  });

  if (!result) {
    redirect(`/student/exams/${exam.id}`);
  }

  // Parse questions
  const addSubQuestions = exam.addSubQuestions ? 
    (typeof exam.addSubQuestions === 'string' ? JSON.parse(exam.addSubQuestions) : exam.addSubQuestions) 
    : [];
  const mulDivQuestions = exam.mulDivQuestions ? 
    (typeof exam.mulDivQuestions === 'string' ? JSON.parse(exam.mulDivQuestions) : exam.mulDivQuestions) 
    : [];

  // Parse answers
  const addSubAnswers = result.addSubAnswers ? 
    (typeof result.addSubAnswers === 'string' ? JSON.parse(result.addSubAnswers) : result.addSubAnswers) 
    : [];
  const mulDivAnswers = result.mulDivAnswers ? 
    (typeof result.mulDivAnswers === 'string' ? JSON.parse(result.mulDivAnswers) : result.mulDivAnswers) 
    : [];

  const timeSpent = result.timeSpent || 0;

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نتیجه آزمون {exam.title}</h1>
          <p className="text-muted-foreground">
            تاریخ آزمون: {new Date(result.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات آزمون</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>زمان صرف شده: {timeSpent} ثانیه</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>نمره: {result.score}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>پاسخ‌های شما</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {addSubQuestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">جمع و تفریق</h3>
                    {addSubQuestions.map((question: any, index: number) => {
                      const studentAnswer = addSubAnswers[index];
                      const isCorrect = studentAnswer !== undefined && 
                        studentAnswer !== '' && 
                        Number(studentAnswer) === Number(question.answer);
                      
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{question.question}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              پاسخ شما: {studentAnswer || 'پاسخ داده نشده'}
                              {!isCorrect && studentAnswer !== '' && (
                                <span className="mr-2"> | پاسخ صحیح: {question.answer}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {mulDivQuestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">ضرب و تقسیم</h3>
                    {mulDivQuestions.map((question: any, index: number) => {
                      const studentAnswer = mulDivAnswers[index];
                      const isCorrect = studentAnswer !== undefined && 
                        studentAnswer !== '' && 
                        Number(studentAnswer) === Number(question.answer);
                      
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{question.question}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              پاسخ شما: {studentAnswer || 'پاسخ داده نشده'}
                              {!isCorrect && studentAnswer !== '' && (
                                <span className="mr-2"> | پاسخ صحیح: {question.answer}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/student/exams">بازگشت به لیست آزمون‌ها</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function calculateAnswer(question: any) {
  const { numbers, operator } = question;
  switch (operator) {
    case '+':
      return numbers.reduce((a: number, b: number) => a + b, 0);
    case '-':
      return numbers.reduce((a: number, b: number) => a - b);
    case '*':
      return numbers.reduce((a: number, b: number) => a * b, 1);
    case '/':
      return numbers.reduce((a: number, b: number) => a / b);
    default:
      return 0;
  }
} 