import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MessageSquare, User } from 'lucide-react';

export default async function StudentDashboard() {
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

  const activitiesCount = await db.activity.count({
    where: { 
      term: student.term
    }
  });

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد دانش‌آموز</h1>
          <p className="text-muted-foreground">
            {`خوش آمدید ${student.firstName} ${student.lastName}`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">پروفایل</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{student.term}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ترم تحصیلی شما
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">فعالیت‌ها</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activitiesCount} فعالیت</div>
              <p className="text-xs text-muted-foreground mt-1">
                تعداد فعالیت‌های تعریف شده ترم شما
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">پیام‌ها</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 پیام</div>
              <p className="text-xs text-muted-foreground mt-1">
                تعداد پیام‌های خوانده نشده
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in delay-300">
          <CardHeader>
            <CardTitle>فعالیت‌های اخیر</CardTitle>
            <CardDescription>
              فعالیت‌های اخیر تعریف شده برای ترم شما
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesCount > 0 ? (
              <p className="text-muted-foreground">
                برای مشاهده فعالیت‌ها به بخش فعالیت‌ها مراجعه کنید.
              </p>
            ) : (
              <p className="text-muted-foreground">
                در حال حاضر فعالیتی برای ترم شما تعریف نشده است.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}