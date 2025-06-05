import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Helper function to ensure backup directory exists
const ensureBackupDir = () => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
  } catch (error) {
    console.error('Error creating backup directory:', error);
    throw new Error('Failed to create backup directory');
  }
};

// Helper function to process data in batches
const processBatch = async (items: any[], batchSize: number, processFn: (batch: any[]) => Promise<void>) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processFn(batch);
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, backupFile } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action not specified' }, { status: 400 });
    }

    const backupDir = ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

    if (action === 'backup') {
      try {
        // Fetch all data from the database
        const users = await prisma.user.findMany({
          include: {
            student: true,
            notifications: true,
          },
        });

        const activities = await prisma.activity.findMany();
        const exams = await prisma.exam.findMany();
        const examResults = await prisma.examResult.findMany();

        // Create backup object
        const backupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          data: {
            users,
            activities,
            exams,
            examResults,
          },
        };

        // Write backup to file
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        return NextResponse.json({ 
          success: true, 
          message: 'Backup created successfully',
          backupPath: backupPath
        });
      } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json({ 
          error: 'Failed to create backup',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (action === 'restore') {
      if (!backupFile) {
        return NextResponse.json({ error: 'Backup file not specified' }, { status: 400 });
      }

      const backupFilePath = path.join(backupDir, backupFile);
      if (!fs.existsSync(backupFilePath)) {
        return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
      }

      try {
        // Read and parse backup file
        const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));
        const BATCH_SIZE = 10;

        // Clear existing data in reverse order of dependencies
        await prisma.examResult.deleteMany();
        await prisma.activity.deleteMany();
        await prisma.exam.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.student.deleteMany();
        await prisma.user.deleteMany();

        // Create a map to store old to new student IDs
        const studentIdMap = new Map<string, string>();

        // First, create users and their related data
        await processBatch(backupData.data.users, BATCH_SIZE, async (batch) => {
          await Promise.all(batch.map(async (user) => {
            const { student, notifications, ...userData } = user;
            const newUser = await prisma.user.create({
              data: {
                ...userData,
                student: student ? {
                  create: {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    nationalId: student.nationalId,
                    dateOfBirth: student.dateOfBirth,
                    mobileNumber: student.mobileNumber,
                    city: student.city,
                    term: student.term,
                    profileImageUrl: student.profileImageUrl,
                  }
                } : undefined,
                notifications: {
                  create: notifications.map(({ id, ...notification }) => notification)
                }
              },
              include: {
                student: true
              }
            });

            // Store the mapping between old and new student IDs
            if (student && newUser.student) {
              studentIdMap.set(student.id, newUser.student.id);
            }
          }));
        });

        // Then create exams
        await processBatch(backupData.data.exams, BATCH_SIZE, async (batch) => {
          await prisma.exam.createMany({ data: batch });
        });

        // Then create activities
        await processBatch(backupData.data.activities, BATCH_SIZE, async (batch) => {
          await prisma.activity.createMany({ data: batch });
        });

        // Finally, create exam results with updated student IDs
        await processBatch(backupData.data.examResults, BATCH_SIZE, async (batch) => {
          const updatedBatch = batch.map(result => ({
            ...result,
            studentId: studentIdMap.get(result.studentId) || result.studentId
          }));
          await prisma.examResult.createMany({ data: updatedBatch });
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Database restored successfully' 
        });
      } catch (error) {
        console.error('Restore error:', error);
        return NextResponse.json({ 
          error: 'Failed to restore backup',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const backupDir = ensureBackupDir();
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          return {
            name: file,
            path: file,
            date: content.timestamp,
            size: stats.size,
            recordCount: {
              users: content.data.users.length,
              activities: content.data.activities.length,
              exams: content.data.exams.length,
              examResults: content.data.examResults.length,
            }
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return NextResponse.json({ backups: files });
    } catch (error) {
      console.error('Error reading backup directory:', error);
      return NextResponse.json({ 
        error: 'Failed to list backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const backupFile = searchParams.get('file');

    if (!backupFile) {
      return NextResponse.json({ error: 'Backup file not specified' }, { status: 400 });
    }

    const backupDir = ensureBackupDir();
    const backupFilePath = path.join(backupDir, backupFile);

    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    try {
      fs.unlinkSync(backupFilePath);
      return NextResponse.json({ 
        success: true, 
        message: 'Backup deleted successfully' 
      });
    } catch (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ 
      error: 'Operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 