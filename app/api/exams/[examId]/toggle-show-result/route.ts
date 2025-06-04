import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const exam = await db.exam.findUnique({
      where: { id: params.examId },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    const updatedExam = await db.exam.update({
      where: { id: params.examId },
      data: { showResult: !exam.showResult },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error('[EXAM_TOGGLE_SHOW_RESULT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 