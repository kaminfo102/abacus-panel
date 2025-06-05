'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Exam {
  id: string;
  title: string;
}

export interface StudentParticipation {
  id: string;
  name: string;
  examTitle: string;
  participationDate: string;
  score: number;
}

export interface Login {
  id: string;
  name: string;
  lastLogin: string;
  loginCount: number;
}

export interface ReportsClientProps {
  exams: Exam[];
  initialExamResults: StudentParticipation[];
  initialLogins: Login[];
}

export function ReportsClient({ exams, initialExamResults, initialLogins }: ReportsClientProps) {
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [participations] = useState<StudentParticipation[]>(initialExamResults);
  const [logins] = useState<Login[]>(initialLogins);

  // Filter participations when exam is selected
  const filteredParticipations = selectedExam === 'all'
    ? participations
    : participations.filter(p => p.examTitle === exams.find(e => e.id === selectedExam)?.title);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="participations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="participations">گزارش شرکت در آزمون‌ها</TabsTrigger>
          <TabsTrigger value="logins">گزارش ورود دانش‌آموزان</TabsTrigger>
        </TabsList>

        <TabsContent value="participations">
          <Card>
            <CardHeader>
              <CardTitle>گزارش شرکت در آزمون‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="انتخاب آزمون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه آزمون‌ها</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ردیف</TableHead>
                    <TableHead>نام دانش‌آموز</TableHead>
                    <TableHead>نام آزمون</TableHead>
                    <TableHead>تاریخ شرکت</TableHead>
                    <TableHead>نمره</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        {selectedExam === 'all' ? 'هیچ آزمونی ثبت نشده است' : 'هیچ شرکت‌کننده‌ای یافت نشد'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipations.map((participation, index) => (
                      <TableRow key={participation.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{participation.name}</TableCell>
                        <TableCell>{participation.examTitle}</TableCell>
                        <TableCell>{participation.participationDate}</TableCell>
                        <TableCell>{participation.score || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredParticipations.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  تعداد کل: {filteredParticipations.length} نفر
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle>گزارش ورود دانش‌آموزان</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ردیف</TableHead>
                    <TableHead>نام دانش‌آموز</TableHead>
                    <TableHead>آخرین ورود</TableHead>
                    <TableHead>تعداد ورود</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        هیچ اطلاعاتی یافت نشد
                      </TableCell>
                    </TableRow>
                  ) : (
                    logins.map((login, index) => (
                      <TableRow key={login.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{login.name}</TableCell>
                        <TableCell>{login.lastLogin}</TableCell>
                        <TableCell>{login.loginCount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {logins.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  تعداد کل: {logins.length} نفر
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 