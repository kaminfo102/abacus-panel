import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { db } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const createActivitySchema = z.object({
  title: z.string().min(2),
  count: z.number().min(1),
  date: z.string(),
  completionTime: z.string(),
  score: z.number().min(1),
  term: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await req.json();
    const validatedData = createActivitySchema.parse(body);

    // Create activity
    const activity = await db.activity.create({
      data: {
        title: validatedData.title,
        count: validatedData.count,
        date: validatedData.date,
        completionTime: validatedData.completionTime,
        score: validatedData.score,
        term: validatedData.term,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('[ACTIVITIES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    let activities;

    // For admin, return all activities
    if (session.user.role === 'ADMIN') {
      activities = await db.activity.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } 
    // For student, return activities for their term
    else if (session.user.role === 'STUDENT' && session.user.studentId) {
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

      activities = await db.activity.findMany({
        where: {
          term: student.term,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    return NextResponse.json(activities);
  } catch (error) {
    console.error('[ACTIVITIES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}