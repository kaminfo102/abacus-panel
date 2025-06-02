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

interface ExamResult {
  id: string;
  score: number;
  timeSpent: number;
  endTime: string;
  exam: {
    id: string;
    title: string;
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

      router.refresh(); // Refresh the page to show updated results
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

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">جزئیات فراگیر: {student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground">
            کد ملی: {student.nationalId} | ترم: {student.term}
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
                        <TableCell className="text-right font-medium">{result.exam.title}</TableCell>
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
      </div>
    </DashboardLayout>
  );
} 