import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-16">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              سامانه آزمون محاسبات ذهنی با چرتکه | کودکان هوشمند کردستان
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              به سامانه آزمون محاسبات ذهنی با چرتکه خوش آمدید
            </p>
          </div>
          
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="hidden md:block">
              <Image 
                src="https://uploadkon.ir/uploads/d8b208_25چرتکه-دانش-آموز.png" 
                alt="دانش‌آموزان"
                width={500}
                height={500}
                className="rounded-lg shadow-lg object-cover h-[400px]"
              />
            </div>
            
            <Card className="w-full shadow-lg animate-slide-in">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-center">ورود به سامانه</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="student" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="student">دانش‌آموز</TabsTrigger>
                    <TabsTrigger value="admin">مدیر</TabsTrigger>
                  </TabsList>
                  <TabsContent value="student">
                    <LoginForm role="STUDENT" />
                  </TabsContent>
                  <TabsContent value="admin">
                    <LoginForm role="ADMIN" />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  دانش‌آموزان عزیز: برای ورود به سامانه از کد ملی به عنوان نام کاربری و شماره موبایل به عنوان رمز عبور استفاده کنید.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}