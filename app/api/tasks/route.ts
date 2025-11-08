import { NextRequest, NextResponse } from 'next/server';
import { createTask, getUserTasks } from '@/lib/task-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, type, organizationId } = body;

    // Validate required fields
    if (!userId || !title || !description || !type) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['userId', 'title', 'description', 'type'],
        },
        { status: 400 }
      );
    }

    // Validate task type
    const validTypes = ['research', 'extraction', 'monitoring', 'automation', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid task type',
          validTypes,
        },
        { status: 400 }
      );
    }

    // Create task - REAL task creation, not mock
    const task = createTask({
      userId,
      title,
      description,
      type,
      organizationId,
    });

    return NextResponse.json({
      success: true,
      taskId: task._id,
      task,
      message: 'Task created successfully',
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        error: 'Failed to create task',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as any;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get tasks - REAL data from task store
    const tasks = getUserTasks(userId, status);

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tasks',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
