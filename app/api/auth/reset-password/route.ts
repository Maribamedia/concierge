import { NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      // Send password reset email via WorkOS
      const passwordReset = await workos.userManagement.createPasswordReset({
        email,
      });

      console.log('Password reset sent:', passwordReset);

      return NextResponse.json({
        message: 'Password reset email sent. Check your inbox!',
      });

    } catch (workosError: any) {
      console.error('WorkOS password reset error:', workosError);
      return NextResponse.json(
        { message: workosError.message || 'Failed to send reset email' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send reset email' },
      { status: 500 }
    );
  }
}
