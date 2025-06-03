import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const examSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  digitCount: z.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.number().min(30, 'حداقل زمان 30 ثانیه باید باشد'),
  operators: z.string().min(1, 'حداقل یک عملگر باید انتخاب شود'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
  addSubQuestions: z.any().optional(),
  mulDivQuestions: z.any().optional(),
});

// Helper functions for generating exam questions
function randomNDigitNumber(digitCount: number): number {
  if (digitCount === 1) return Math.floor(Math.random() * 9) + 1;
  const min = Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateExamRows(exam: { operators: string; rowCount: number; itemsPerRow: number; digitCount: number }) {
  const rows = [];
  const operators = exam.operators.split(',');
  for (let questionIndex = 0; questionIndex < exam.rowCount; questionIndex++) {
    const items = [];
    for (let rowIndex = 0; rowIndex < exam.itemsPerRow; rowIndex++) {
      const value = randomNDigitNumber(exam.digitCount);
      const operator = rowIndex === 0 ? '' : operators[Math.floor(Math.random() * operators.length)];
      items.push({ value: value.toString(), operator });
    }
    rows.push({ items });
  }
  return rows;
}

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const exam = await db.exam.findUnique({
      where: {
        id: params.examId,
      },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    if (session.user.role === 'STUDENT' && session.user.studentId) {
      const student = await db.student.findUnique({
        where: {
          id: session.user.studentId,
        },
        select: {
          term: true,
        },
      });

      if (!student || student.term !== exam.term) {
        return new NextResponse('Unauthorized', { status: 403 });
      }
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('[EXAM_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = examSchema.parse(body);

    const exam = await db.exam.update({
      where: {
        id: params.examId,
      },
      data: {
        title: validatedData.title,
        digitCount: validatedData.digitCount,
        rowCount: validatedData.rowCount,
        itemsPerRow: validatedData.itemsPerRow,
        timeLimit: validatedData.timeLimit * 60, // تبدیل دقیقه به ثانیه
        operators: validatedData.operators,
        term: validatedData.term,
        addSubQuestions: validatedData.addSubQuestions,
        mulDivQuestions: validatedData.mulDivQuestions,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('[EXAM_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    await db.exam.delete({
      where: {
        id: params.examId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[EXAM_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}