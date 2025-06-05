import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ReportsClient } from './reports-client';

export default async function AdminReports() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch all exams
  const exams = await db.exam.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch all exam results with student and exam details
  const examResults = await db.examResult.findMany({
    select: {
      id: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
        },
      },
      score: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch student login data
  const students = await db.student.findMany({
    include: {
      user: {
        include: {
          notifications: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  // Format the data for the client component
  const formattedExamResults = examResults.map(result => ({
    id: result.id,
    name: `${result.student.firstName} ${result.student.lastName}`,
    examTitle: result.exam.title,
    participationDate: result.createdAt.toLocaleDateString('fa-IR'),
    score: result.score,
  }));

  const formattedLogins = students
    .filter(student => student.user && student.user.updatedAt)
    .sort((a, b) => b.user.updatedAt.getTime() - a.user.updatedAt.getTime())
    .map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      lastLogin: student.user.updatedAt.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      loginCount: student.user.notifications.length,
    }));

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">گزارش‌های مدیریتی</h1>
          <p className="text-muted-foreground">
            مشاهده گزارش‌های سیستم
          </p>
        </div>

        <ReportsClient 
          exams={exams}
          initialExamResults={formattedExamResults}
          initialLogins={formattedLogins}
        />
      </div>
    </DashboardLayout>
  );
} 