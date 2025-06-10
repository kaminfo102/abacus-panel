import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
// import { ActivityForm } from '@/components/activity/activity-form';

export default async function NewActivity() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="page-transition space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">افزودن فعالیت جدید</h1>
          <p className="text-muted-foreground">
            اطلاعات فعالیت جدید را وارد کنید
          </p>
        </div>

        {/* <ActivityForm /> */}
      </div>
    </DashboardLayout>
  );
}