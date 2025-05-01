import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ActivityTable } from '@/components/activity/activity-table';

export default async function Activities() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const activities = await db.activity.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">مدیریت فعالیت‌ها</h1>
            <p className="text-muted-foreground">
              اضافه، ویرایش و حذف فعالیت‌های دانش‌آموزان
            </p>
          </div>
          <Link href="/admin/activities/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              افزودن فعالیت
            </Button>
          </Link>
        </div>

        <ActivityTable activities={activities} />
      </div>
    </DashboardLayout>
  );
}