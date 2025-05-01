import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { User, MapPin, Calendar, Phone, CreditCard } from 'lucide-react';

export default async function StudentProfile() {
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
          <h1 className="text-3xl font-bold tracking-tight">پروفایل من</h1>
          <p className="text-muted-foreground">
            اطلاعات شخصی شما
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2 animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-20 h-20 relative rounded-full overflow-hidden border">
                {student.profileImageUrl ? (
                  <Image 
                    src={student.profileImageUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {student.firstName} {student.lastName}
                </CardTitle>
                <p className="text-muted-foreground">
                  {student.term}
                </p>
              </div>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in delay-100">
            <CardHeader>
              <CardTitle className="text-lg">اطلاعات شخصی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">کد ملی</p>
                  <p>{student.nationalId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاریخ تولد</p>
                  <p>{student.dateOfBirth}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">شماره موبایل</p>
                  <p>{student.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">شهرستان</p>
                  <p>{student.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in delay-200">
            <CardHeader>
              <CardTitle className="text-lg">اطلاعات تحصیلی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">ترم تحصیلی</p>
                  <p>{student.term}</p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">راهنمای دانش‌آموز</p>
                <p className="text-sm text-muted-foreground">
                  برای مشاهده فعالیت‌های تعریف شده برای ترم خود، به بخش «فعالیت‌های من» مراجعه کنید.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}