import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcrypt';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const createStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  nationalId: z.string().length(10),
  dateOfBirth: z.string(),
  mobileNumber: z.string().min(11).max(11),
  city: z.string(),
  term: z.string(),
  profileImageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if student with national ID already exists
    const existingStudent = await db.student.findUnique({
      where: {
        nationalId: validatedData.nationalId,
      },
    });

    if (existingStudent) {
      return new NextResponse('Student with this national ID already exists', { status: 400 });
    }

    // Create user and student in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          email: `${validatedData.nationalId}@example.com`, // Placeholder email
          password: validatedData.mobileNumber, // Using mobile number as password directly for simplicity
          role: 'STUDENT',
        },
      });

      // Create student linked to user
      const student = await prisma.student.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          nationalId: validatedData.nationalId,
          dateOfBirth: validatedData.dateOfBirth,
          mobileNumber: validatedData.mobileNumber,
          city: validatedData.city,
          term: validatedData.term,
          profileImageUrl: validatedData.profileImageUrl,
          userId: user.id,
        },
      });

      return student;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[STUDENTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Get all students with their exam results
    const students = await db.student.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        examResults: {
          include: {
            exam: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    // Log raw data for debugging
    console.log('Raw students data from database:', JSON.stringify(students.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      examResultsCount: s.examResults.length,
      examResults: s.examResults.map(er => ({
        id: er.id,
        score: er.score,
        examId: er.examId,
        examTitle: er.exam.title
      }))
    })), null, 2));

    // Transform the data
    const formattedStudents = students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      nationalId: student.nationalId,
      mobileNumber: student.mobileNumber,
      city: student.city,
      term: student.term,
      examResults: student.examResults.map(er => ({
        id: er.id,
        score: er.score,
        examId: er.examId,
        examTitle: er.exam.title
      }))
    }));

    // Log formatted data for debugging
    console.log('Formatted students data for response:', JSON.stringify(formattedStudents.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      examResultsCount: s.examResults.length,
      examResults: s.examResults
    })), null, 2));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error('[STUDENTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}