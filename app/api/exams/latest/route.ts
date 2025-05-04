import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'STUDENT' || !session.user.studentId) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  const student = await db.student.findUnique({
    where: { id: session.user.studentId },
  });
  if (!student) {
    return new NextResponse('Student not found', { status: 404 });
  }

  const latestExam = await db.exam.findFirst({
    where: { term: student.term },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(latestExam);
} 