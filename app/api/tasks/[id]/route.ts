import { NextRequest, NextResponse } from 'next/server';
import { getTask, deleteTask } from '@/lib/task-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Get real task from store
    const task = getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch task',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Real deletion from store
    const deleted = deleteTask(taskId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete task',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
