import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StudentTable } from '@/components/student/student-table';
import { StudentImport } from '@/components/student/student-import';

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return null;
  }

  // Get all students with their exam results
  const students = await db.student.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      examResults: {
        include: {
          exam: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  // Transform the data
  const formattedStudents = students.map(student => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    nationalId: student.nationalId,
    mobileNumber: student.mobileNumber,
    city: student.city,
    term: student.term,
    examResults: student.examResults.map(er => ({
      id: er.id,
      score: er.score,
      examId: er.examId,
      examTitle: er.exam.title
    }))
  }));

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">مدیریت فراگیران</h1>
            <p className="text-muted-foreground">
              اضافه، ویرایش و حذف فراگیران سیستم
            </p>
          </div>
          <div className="flex gap-4">
            <StudentImport />
            <Link href="/admin/students/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                افزودن دانش‌آموز
              </Button>
            </Link>
          </div>
        </div>

        <StudentTable students={formattedStudents} />
      </div>
    </DashboardLayout>
  );
}