import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExamForm } from '@/components/exam/exam-form';

export default async function NewExam() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">افزودن آزمون جدید</h1>
          <p className="text-muted-foreground">
            اطلاعات آزمون جدید را وارد کنید
          </p>
        </div>

        <ExamForm />
      </div>
    </DashboardLayout>
  );
}