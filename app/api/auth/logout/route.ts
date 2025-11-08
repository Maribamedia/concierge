import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear session
    // In production, invalidate session in WorkOS

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
