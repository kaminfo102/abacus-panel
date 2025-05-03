import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const examResultSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  score: z.number().min(0).max(100),
  answers: z.string(),
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
    const result = await db.examResult.create({
      data: {
        ...validatedData,
        endTime: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[EXAM_RESULTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 