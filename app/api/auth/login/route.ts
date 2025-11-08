import { NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { syncUserToConvex, updateLastLogin } from '@/lib/convex-sync';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // Authenticate with WorkOS
      const { user, accessToken, refreshToken } = await workos.userManagement.authenticateWithPassword({
        email,
        password,
        clientId,
      });

      // Sync user to Convex and update last login
      await syncUserToConvex({
        workosUserId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        emailVerified: user.emailVerified,
      });
      await updateLastLogin(user.id);

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
        message: 'Login successful',
      });

    } catch (workosError: any) {
      // Handle authentication errors
      if (workosError.code === 'invalid_credentials' || workosError.code === 'user_not_found') {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.error('WorkOS authentication error:', workosError);
      return NextResponse.json(
        { message: workosError.message || 'Authentication failed' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
