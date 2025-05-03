import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default async function StudentMessages() {
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

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">پیام‌های من</h1>
          <p className="text-muted-foreground">
            پیام‌های ارسالی از طرف مدیر سیستم
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              پیام‌ها
            </CardTitle>
            <CardDescription>
              پیام‌های مرتبط با {student.term}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">
                در حال حاضر پیامی برای شما وجود ندارد.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}