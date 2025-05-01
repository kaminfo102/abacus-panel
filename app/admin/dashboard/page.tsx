import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, CalendarIcon, BarChart2 } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const studentsCount = await db.student.count();
  const activitiesCount = await db.activity.count();
  
  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">داشبورد مدیریت</h1>
          <p className="text-muted-foreground">
            مدیریت دانش‌آموزان و فعالیت‌ها
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">تعداد دانش‌آموزان</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsCount} نفر</div>
              <p className="text-xs text-muted-foreground mt-1">
                تعداد کل دانش‌آموزان ثبت شده در سیستم
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">تعداد فعالیت‌ها</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activitiesCount} فعالیت</div>
              <p className="text-xs text-muted-foreground mt-1">
                تعداد کل فعالیت‌های تعریف شده در سیستم
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in delay-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">آمار فعالیت‌ها</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                آمار فعالیت‌های انجام شده در این ماه
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in delay-300">
          <CardHeader>
            <CardTitle>دسترسی سریع</CardTitle>
            <CardDescription>
              لینک‌های دسترسی سریع به بخش‌های مختلف سیستم
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-medium">مدیریت دانش‌آموزان</h3>
              <p className="text-sm text-muted-foreground mt-1">
                اضافه، ویرایش و حذف دانش‌آموزان
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-medium">مدیریت فعالیت‌ها</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تعریف و مدیریت فعالیت‌ها برای دانش‌آموزان
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
              <h3 className="font-medium">تنظیمات سیستم</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تنظیمات و پیکربندی سیستم
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}