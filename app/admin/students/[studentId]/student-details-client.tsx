'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ExamResult {
  id: string;
  score: number;
  timeSpent: number;
  endTime: string;
  addSubAnswers: any[];
  mulDivAnswers: any[];
  exam: {
    id: string;
    title: string;
    addSubQuestions: any[];
    mulDivQuestions: any[];
  };
}

interface StudentDetailsClientProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    mobileNumber: string;
    city: string;
    term: string;
  };
  examResults: ExamResult[];
}

export function StudentDetailsClient({ student, examResults }: StudentDetailsClientProps) {
  const router = useRouter();
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  const handleDeleteResult = async (resultId: string) => {
    setDeletingResultId(resultId);
    try {
      const response = await fetch(`/api/exam-results/${resultId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'مشکلی در حذف نتیجه آزمون رخ داده است');
      }

      toast({
        title: 'موفقیت‌آمیز',
        description: 'نتیجه آزمون با موفقیت حذف شد.',
      });

      router.refresh();
    } catch (error) {
      console.error('Delete result error:', error);
      toast({
        title: 'خطا',
        description: error instanceof Error 
          ? error.message 
          : 'مشکلی در حذف نتیجه آزمون رخ داده است.',
        variant: 'destructive',
      });
    } finally {
      setDeletingResultId(null);
    }
  };

  const handleViewResult = (result: ExamResult) => {
    setSelectedResult(result);
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">جزئیات فراگیر: {student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground">
            کد ملی: {student.nationalId} | ترم: {student.term} | تعداد کل آزمون‌ها: {examResults.length}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">گزارش آزمون‌ها</h2>
            {examResults.length === 0 ? (
              <p>این دانش‌آموز هنوز در هیچ آزمونی شرکت نکرده است.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">عنوان آزمون</TableHead>
                      <TableHead className="text-right">امتیاز</TableHead>
                      <TableHead className="text-right">زمان صرف شده (ثانیه)</TableHead>
                      <TableHead className="text-right">تاریخ و ساعت</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="text-right font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => handleViewResult(result)}
                          >
                            {result.exam.title}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">{result.score}</TableCell>
                        <TableCell className="text-right">{result.timeSpent}</TableCell>
                        <TableCell className="text-right">
                          {new Date(result.endTime).toLocaleString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteResult(result.id)}
                            disabled={deletingResultId === result.id}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">نتیجه آزمون {selectedResult.exam.title}</h2>
                <Button variant="outline" onClick={() => setSelectedResult(null)}>بستن</Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>زمان صرف شده: {selectedResult.timeSpent} ثانیه</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>نمره: {selectedResult.score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {selectedResult.exam.addSubQuestions?.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">جمع و تفریق</h3>
                          {selectedResult.exam.addSubQuestions.map((question: any, index: number) => {
                            const studentAnswer = selectedResult.addSubAnswers?.[index];
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

                      {selectedResult.exam.mulDivQuestions?.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold">ضرب و تقسیم</h3>
                          {selectedResult.exam.mulDivQuestions.map((question: any, index: number) => {
                            const studentAnswer = selectedResult.mulDivAnswers?.[index];
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
} 