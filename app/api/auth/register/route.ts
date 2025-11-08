import { NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { syncUserToConvex } from '@/lib/convex-sync';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    try {
      // Create user in WorkOS User Management
      const user = await workos.userManagement.createUser({
        email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        emailVerified: false,
      });

      // Create session for the user
      const { accessToken, refreshToken } = await workos.userManagement.authenticateWithPassword({
        email,
        password,
        clientId,
      });

      // Sync user to Convex database
      await syncUserToConvex({
        workosUserId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        emailVerified: user.emailVerified,
      });

      // Return user data and session token
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          emailVerified: user.emailVerified,
        },
        token: accessToken,
        refreshToken,
        message: 'Account created successfully',
      });

    } catch (workosError: any) {
      // Handle WorkOS-specific errors
      if (workosError.code === 'user_already_exists') {
        return NextResponse.json(
          { message: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      console.error('WorkOS error:', workosError);
      return NextResponse.json(
        { message: workosError.message || 'Failed to create account' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
