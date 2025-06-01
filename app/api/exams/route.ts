import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const examSchema = z.object({
  title: z.string(),
  digitCount: z.number(),
  rowCount: z.number(),
  itemsPerRow: z.number(),
  timeLimit: z.number(),
  operators: z.string(),
  term: z.string(),
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = examSchema.parse(body);

    // داده‌های سوالات جدید
    let addSubQuestions = body.addSubQuestions;
    let mulDivQuestions = body.mulDivQuestions;
    if (typeof addSubQuestions === 'string') addSubQuestions = JSON.parse(addSubQuestions);
    if (typeof mulDivQuestions === 'string') mulDivQuestions = JSON.parse(mulDivQuestions);

    // Generate questions and save in questionsJson
    const questions = generateExamRows(validatedData);

    // Create exam
    const exam = await db.exam.create({
      data: {
        title: validatedData.title,
        digitCount: validatedData.digitCount,
        rowCount: validatedData.rowCount,
        itemsPerRow: validatedData.itemsPerRow,
        timeLimit: validatedData.timeLimit,
        operators: validatedData.operators,
        term: validatedData.term,
        addSubQuestions: addSubQuestions || null,
        mulDivQuestions: mulDivQuestions || null,
      },
    });

    // Find all students in the same term
    const students = await db.student.findMany({
      where: {
        term: validatedData.term,
      },
      select: {
        userId: true,
      },
    });

    // Create notifications for all students in the term
    await Promise.all(
      students.map((student) =>
        db.notification.create({
          data: {
            title: 'آزمون جدید',
            message: `آزمون ${exam.title} برای ترم ${exam.term} تعریف شده است.`,
            userId: student.userId,
          },
        })
      )
    );

    return NextResponse.json(exam);
  } catch (error) {
    console.error('[EXAMS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    let exams;

    if (session.user.role === 'ADMIN') {
      exams = await db.exam.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (session.user.role === 'STUDENT' && session.user.studentId) {
      const student = await db.student.findUnique({
        where: {
          id: session.user.studentId,
        },
        select: {
          term: true,
        },
      });

      if (!student) {
        return new NextResponse('Student not found', { status: 404 });
      }

      exams = await db.exam.findMany({
        where: {
          term: student.term,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(exams);
  } catch (error) {
    console.error('[EXAMS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}