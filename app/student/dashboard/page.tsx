import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MessageSquare, User, AlertCircle, Clock, Calculator, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface Exam {
  id: string;
  title: string;
  digitCount: number;
  timeLimit: number;
  isActive: boolean;
  term: string;
  createdAt: Date;
  updatedAt: Date;
  rowCount: number;
  itemsPerRow: number;
  operators: string;
  addSubQuestions: any;
  mulDivQuestions: any;
}

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

  const latestExam = await db.exam.findFirst({
    where: { term: student.term },
    orderBy: { createdAt: 'desc' },
  }) as Exam | null;

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-[url('/default-profile.png')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
              {student.profileImageUrl ? (
                <Image 
                  src={student.profileImageUrl ? student.profileImageUrl : '/default-profile.png'}
                  alt={`${student.firstName} ${student.lastName}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-white/80" />
                </div>
              )}
            </div>
            <div>
              {/* <h1 className="text-4xl font-bold tracking-tight text-white mb-2">داشبورد دانش‌آموز</h1> */}
              <p className="font-bold tracking-tight text-white text-lg">
                {`خوش آمدید ${student.firstName} ${student.lastName}`}
              </p>
            </div>
          </div>
        </div>

        {latestExam && (
          <Card className={`animate-pulse border-2 ${latestExam.isActive ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20' : 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className={`text-lg font-bold ${latestExam.isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {latestExam.isActive ? 'آزمون جدید' : 'آزمون غیرفعال'}
              </CardTitle>
              <Calculator className={`h-6 w-6 ${latestExam.isActive ? 'text-red-500' : 'text-gray-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{latestExam.title}</div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>زمان: {latestExam.timeLimit} دقیقه</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calculator className="h-4 w-4" />
                  <span>تعداد ارقام: {latestExam.digitCount}</span>
                </div>
              </div>
              {latestExam.isActive ? (
                <Link href={`/student/exams/${latestExam.id}`} className="block">
                  <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Play className="h-5 w-5 ml-2" />
                    شروع آزمون
                  </Button>
                </Link>
              ) : (
                <div className="cursor-not-allowed">
                  <Button 
                    className="w-full h-12 text-lg font-bold bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                    disabled
                  >
                    <AlertCircle className="h-5 w-5 ml-2" />
                    آزمون غیرفعال است
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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