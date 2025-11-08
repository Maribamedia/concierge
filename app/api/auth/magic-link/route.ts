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
      // Send magic link via WorkOS
      const magicAuth = await workos.userManagement.createMagicAuth({
        email,
      });

      console.log('Magic link sent:', magicAuth);

      return NextResponse.json({
        message: 'Magic link sent successfully. Check your email!',
        code: magicAuth.code,
      });

    } catch (workosError: any) {
      console.error('WorkOS magic link error:', workosError);
      return NextResponse.json(
        { message: workosError.message || 'Failed to send magic link' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
