import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calculator, Grid, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ExamWithActive {
  id: string;
  title: string;
  digitCount: number;
  rowCount: number;
  itemsPerRow: number;
  timeLimit: number;
  operators: string;
  term: string;
  isActive: boolean;
  addSubQuestions: any;
  mulDivQuestions: any;
  createdAt: Date;
  updatedAt: Date;
}

export default async function StudentExams() {
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

  const exams = await db.exam.findMany({
    where: { 
      term: student.term
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as ExamWithActive[];

  // Get exam results for the student
  const examResults = await db.examResult.findMany({
    where: {
      studentId: student.id,
    },
  });

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">آزمون‌های من</h1>
          <p className="text-muted-foreground">
            لیست آزمون‌های تعریف شده برای {student.term}
          </p>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">در حال حاضر آزمونی برای ترم شما تعریف نشده است.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam, index) => {
              const result = examResults.find(r => r.examId === exam.id);
              const hasTaken = !!result;
              const canAccess = exam.isActive || hasTaken;

              return (
                <Card key={exam.id} className={`animate-fade-in delay-${index * 100}`}>
                  <CardHeader>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>
                      ترم: {exam.term}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">زمان: {exam.timeLimit} ثانیه</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">عملگرها: {exam.operators}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Grid className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">تعداد سوال: {exam.rowCount}</span>
                        </div>
                        {hasTaken && result && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">نمره: {result.score}</span>
                          </div>
                        )}
                        {!exam.isActive && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">این آزمون در حال حاضر غیرفعال است</span>
                          </div>
                        )}
                      </div>

                      {canAccess ? (
                        <Link href={hasTaken ? `/student/exams/${exam.id}/result` : `/student/exams/${exam.id}`}>
                          <Button 
                            className="w-full" 
                            disabled={!exam.isActive && !hasTaken}
                          >
                            {hasTaken ? 'مشاهده نتیجه' : 'شروع آزمون'}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className="w-full" 
                          disabled={true}
                        >
                          شروع آزمون
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}