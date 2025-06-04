import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExamTable } from '@/components/exam/exam-table';

export default async function Exams() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const exams = await db.exam.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const transformedExams = exams.map(exam => ({
    ...exam,
    showResult: false,
    addSubQuestions: typeof exam.addSubQuestions === 'string' 
      ? JSON.parse(exam.addSubQuestions)
      : exam.addSubQuestions,
    mulDivQuestions: typeof exam.mulDivQuestions === 'string'
      ? JSON.parse(exam.mulDivQuestions)
      : exam.mulDivQuestions,
  }));

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">مدیریت آزمون‌ها</h1>
            <p className="text-muted-foreground">
              اضافه، ویرایش و حذف آزمون‌های دانش‌آموزان
            </p>
          </div>
          <Link href="/admin/exams/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              افزودن آزمون
            </Button>
          </Link>
        </div>

        <ExamTable exams={transformedExams} />
      </div>
    </DashboardLayout>
  );
}