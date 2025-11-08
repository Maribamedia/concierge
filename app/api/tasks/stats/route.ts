import { NextRequest, NextResponse } from 'next/server';
import { getTaskStats } from '@/lib/task-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get real statistics
    const stats = getTaskStats(userId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching task stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch task stats',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
