import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MessageSquare, User, AlertCircle } from 'lucide-react';

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">داشبورد دانش‌آموز</h1>
          <p className="text-blue-100 text-lg">
            {`خوش آمدید ${student.firstName} ${student.lastName}`}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-fade-in hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">پروفایل</CardTitle>
              <User className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{student.term}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ترم تحصیلی شما
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-100 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">فعالیت‌ها</CardTitle>
              <CalendarIcon className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{activitiesCount} فعالیت</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                تعداد فعالیت‌های تعریف شده ترم شما
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-200 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">پیام‌ها</CardTitle>
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">0 پیام</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                تعداد پیام‌های خوانده نشده
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in delay-300 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">فعالیت‌های اخیر</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              فعالیت‌های اخیر تعریف شده برای ترم شما
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesCount > 0 ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-blue-700 dark:text-blue-300">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  برای مشاهده فعالیت‌ها به بخش فعالیت‌ها مراجعه کنید.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-gray-600 dark:text-gray-400">
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  در حال حاضر فعالیتی برای ترم شما تعریف نشده است.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}