import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const examResultSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  addSubAnswers: z.array(z.union([z.string(), z.number()])).optional(),
  mulDivAnswers: z.array(z.union([z.string(), z.number()])).optional(),
  timeSpent: z.number().optional(),
});

type ExamResultData = z.infer<typeof examResultSchema>;

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

    // Get the exam to access questions
    const exam = await db.exam.findUnique({
      where: { id: validatedData.examId },
    });

    if (!exam) {
      return new NextResponse('Exam not found', { status: 404 });
    }

    // Calculate score
    let totalScore = 0;
    let totalQuestions = 0;

    // Check add/sub answers
    if (validatedData.addSubAnswers && exam.addSubQuestions) {
      const addSubQuestions = typeof exam.addSubQuestions === 'string' 
        ? JSON.parse(exam.addSubQuestions) 
        : exam.addSubQuestions;
      
      addSubQuestions.forEach((question: { answer: number }, index: number) => {
        const studentAnswer = validatedData.addSubAnswers?.[index];
        totalQuestions++;
        if (studentAnswer !== undefined && studentAnswer !== '') {
          const normalizedStudentAnswer = Number(studentAnswer);
          const normalizedCorrectAnswer = Number(question.answer);
          if (!isNaN(normalizedStudentAnswer) && normalizedStudentAnswer === normalizedCorrectAnswer) {
            totalScore += 1;
          }
        }
      });
    }

    // Check mul/div answers
    if (validatedData.mulDivAnswers && exam.mulDivQuestions) {
      const mulDivQuestions = typeof exam.mulDivQuestions === 'string'
        ? JSON.parse(exam.mulDivQuestions)
        : exam.mulDivQuestions;
      
      mulDivQuestions.forEach((question: { answer: number }, index: number) => {
        const studentAnswer = validatedData.mulDivAnswers?.[index];
        totalQuestions++;
        if (studentAnswer !== undefined && studentAnswer !== '') {
          const normalizedStudentAnswer = Number(studentAnswer);
          const normalizedCorrectAnswer = Number(question.answer);
          if (!isNaN(normalizedStudentAnswer) && normalizedStudentAnswer === normalizedCorrectAnswer) {
            totalScore += 1;
          }
        }
      });
    }

    // Calculate percentage score (out of 100)
    const percentageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    // Create exam result with proper typing
    const examResultData: Prisma.ExamResultCreateInput = {
      exam: { connect: { id: validatedData.examId } },
      student: { connect: { id: validatedData.studentId } },
      score: percentageScore,
      endTime: new Date(),
      addSubAnswers: validatedData.addSubAnswers ? validatedData.addSubAnswers : undefined,
      mulDivAnswers: validatedData.mulDivAnswers ? validatedData.mulDivAnswers : undefined,
      timeSpent: validatedData.timeSpent,
    };

    const result = await db.examResult.create({
      data: examResultData,
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