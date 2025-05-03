import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StudentForm } from '@/components/student/student-form';

export default async function NewStudent() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">افزودن دانش‌آموز جدید</h1>
          <p className="text-muted-foreground">
            اطلاعات دانش‌آموز جدید را وارد کنید
          </p>
        </div>

        <StudentForm />
      </div>
    </DashboardLayout>
  );
}