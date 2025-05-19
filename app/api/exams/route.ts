import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const examSchema = z.object({
  title: z.string().min(2, 'عنوان باید حداقل 2 حرف باشد'),
  digitCount: z.number().min(1, 'حداقل یک رقم باید وارد شود'),
  rowCount: z.number().min(1, 'حداقل یک ردیف باید وارد شود'),
  itemsPerRow: z.number().min(1, 'حداقل یک آیتم در هر ردیف باید وارد شود'),
  timeLimit: z.number().min(30, 'حداقل زمان 30 ثانیه باید باشد'),
  operators: z.string().min(1, 'حداقل یک عملگر باید انتخاب شود'),
  term: z.string().min(1, 'انتخاب ترم الزامی است'),
  creationMode: z.enum(['automatic', 'manual']),
  questionsJson: z.string().nullable(),
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

// Add validation for manual questions
const validateManualQuestions = (questions: any[], rowCount: number, itemsPerRow: number) => {
  if (!Array.isArray(questions) || questions.length !== rowCount) {
    throw new Error('Invalid questions format');
  }

  for (const row of questions) {
    if (!row.items || !Array.isArray(row.items) || row.items.length !== itemsPerRow) {
      throw new Error('Invalid items format in questions');
    }

    for (let i = 0; i < row.items.length; i++) {
      const item = row.items[i];
      if (!item.value || typeof item.value !== 'string') {
        throw new Error('Invalid value in question item');
      }
      if (i < row.items.length - 1 && (!item.operator || typeof item.operator !== 'string')) {
        throw new Error('Invalid operator in question item');
      }
    }
  }

  return true;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = examSchema.parse(body);

    // Generate questions if in automatic mode
    let questions;
    if (validatedData.creationMode === 'automatic') {
      questions = generateExamRows(validatedData);
    } else if (validatedData.questionsJson) {
      questions = JSON.parse(validatedData.questionsJson);
      // Validate manual questions
      validateManualQuestions(questions, validatedData.rowCount, validatedData.itemsPerRow);
    } else {
      questions = null;
    }

    // Create exam without creationMode field
    const { creationMode, ...examData } = validatedData;
    const exam = await db.exam.create({
      data: {
        ...examData,
        questionsJson: questions ? JSON.stringify(questions) : null,
        isManual: creationMode === 'manual',
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