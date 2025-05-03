import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExamTakingForm } from '@/components/exam/exam-taking-form';

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="text-muted-foreground">
            زمان آزمون: {exam.timeLimit} ثانیه
          </p>
        </div>

        <ExamTakingForm exam={exam} student={student} />
      </div>
    </DashboardLayout>
  );
} 