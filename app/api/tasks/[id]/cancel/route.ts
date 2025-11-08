import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask } from '@/lib/task-store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    const task = getTask(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (['completed', 'failed', 'cancelled'].includes(task.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel a task that is already finished' },
        { status: 400 }
      );
    }

    // Real cancellation
    updateTask(taskId, {
      status: 'cancelled',
      completedAt: Date.now(),
      currentStep: 'Task cancelled by user',
    });

    return NextResponse.json({
      success: true,
      message: 'Task cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling task:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel task',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
