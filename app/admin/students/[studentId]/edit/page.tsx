import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StudentForm } from '@/components/student/student-form';

interface EditStudentPageProps {
  params: {
    studentId: string;
  };
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const student = await db.student.findUnique({
    where: {
      id: params.studentId,
    },
    include: {
      user: true,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ویرایش دانش‌آموز</h1>
          <p className="text-muted-foreground">
            ویرایش اطلاعات دانش‌آموز
          </p>
        </div>

        <StudentForm student={student} />
      </div>
    </DashboardLayout>
  );
} 