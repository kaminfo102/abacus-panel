import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const updateStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string(),
  mobileNumber: z.string().min(11).max(11),
  city: z.string(),
  term: z.string(),
  profileImageUrl: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Allow admin to access any student, but students can only access their own data
    if (session.user.role === 'STUDENT' && session.user.studentId !== params.studentId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const student = await db.student.findUnique({
      where: {
        id: params.studentId,
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('[STUDENT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, dateOfBirth, mobileNumber, city, term } = body;

    const student = await db.student.update({
      where: {
        id: params.studentId,
      },
      data: {
        firstName,
        lastName,
        dateOfBirth,
        mobileNumber,
        city,
        term,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('[STUDENT_UPDATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const student = await db.student.findUnique({
      where: {
        id: params.studentId,
      },
      include: {
        user: true,
      },
    });

    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    // Delete the student and their associated user account
    await db.student.delete({
      where: {
        id: params.studentId,
      },
    });

    await db.user.delete({
      where: {
        id: student.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[STUDENT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}