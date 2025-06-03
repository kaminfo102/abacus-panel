import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExamTakingForm } from '@/components/exam/exam-taking-form';
import { Clock } from 'lucide-react';

interface ExamPageProps {
  params: {
    examId: string;
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
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

  // Check if student has already taken this exam
  const existingResult = await db.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: exam.id,
        studentId: student.id,
      },
    },
  });

  if (existingResult) {
    redirect(`/student/exams/${exam.id}/result`);
  }

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 px-4 py-3 rounded-xl border border-green-200 dark:border-green-800 shadow-md w-full max-w-lg sm:max-w-md">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-green-700 dark:text-green-300 text-center">
                {exam.title}
              </h1>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <p className="text-base sm:text-lg font-medium">
                  زمان آزمون: {exam.timeLimit} دقیقه
                </p>
              </div>
            </div>
          </div>
        </div>

        <ExamTakingForm exam={exam} student={student} />
      </div>
    </DashboardLayout>
  );
} 