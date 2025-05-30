import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const examResultSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  addSubAnswers: z.any().optional(),
  mulDivAnswers: z.any().optional(),
  timeSpent: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'STUDENT' || !session.user.studentId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = examResultSchema.parse(body);

    // Verify that the student is taking their own exam
    if (validatedData.studentId !== session.user.studentId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Create exam result
    const data: any = {
      examId: validatedData.examId,
      studentId: validatedData.studentId,
      addSubAnswers: validatedData.addSubAnswers ?? undefined,
      mulDivAnswers: validatedData.mulDivAnswers ?? undefined,
      endTime: new Date(),
    };
    if (validatedData.timeSpent !== undefined) {
      data.timeSpent = validatedData.timeSpent;
    }
    const result = await db.examResult.create({
      data,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint failed (already submitted)
      return new NextResponse('نتیجه این آزمون قبلاً ثبت شده است.', { status: 409 });
    }
    console.error('[EXAM_RESULTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 