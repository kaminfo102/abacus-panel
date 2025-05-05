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

  const answers = JSON.parse(result.answers);
  const questions = exam.questionsJson ? JSON.parse(exam.questionsJson) : [];
  const timeSpent = result.endTime && result.startTime ? Math.round((result.endTime.getTime() - result.startTime.getTime()) / 1000) : 0;

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
                <span>زمان صرف شده: {result.timeSpent} ثانیه</span>
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
                {Object.entries(answers)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([rowIndex, answer]: [string, any], displayIndex: number) => {
                    const questionIndex = parseInt(rowIndex);
                    const question = questions[questionIndex];
                    if (!question) return null;
                    
                    return (
                      <div key={rowIndex} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>سوال {displayIndex + 1}:</span>
                          <div className="flex items-center gap-1">
                            {question.items.map((item: any, index: number) => (
                              <React.Fragment key={index}>
                                {index > 0 && (
                                  <span className="mx-1 text-blue-600 dark:text-blue-400">
                                    {item.operator}
                                  </span>
                                )}
                                <span>{item.value}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm font-medium">پاسخ شما: </span>
                            <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {answer.value ?? 'پاسخ داده نشده'}
                            </span>
                          </div>
                          {answer.submitted !== undefined && (
                            <div>
                              {answer.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link href="/student/exams">
            <Button>بازگشت به لیست آزمون‌ها</Button>
          </Link>
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