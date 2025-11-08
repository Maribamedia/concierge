import { NextRequest, NextResponse } from 'next/server';
import {
  getPayfastConfig,
  validateSignature,
  validatePayfastIP,
  verifyPaymentAmount,
} from '@/lib/payfast';

// Dynamic import of Convex to avoid build-time errors
let convexClient: any = null;

async function getConvexClient() {
  if (!convexClient && process.env.NEXT_PUBLIC_CONVEX_URL) {
    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');
    convexClient = {
      client: new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL),
      api,
    };
  }
  return convexClient;
}

/**
 * Payfast ITN (Instant Transaction Notification) Webhook Handler
 * Handles payment notifications from Payfast for both one-time and recurring payments
 */
export async function POST(request: NextRequest) {
  try {
    // Get ITN data from request body
    const formData = await request.formData();
    const itnData: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      itnData[key] = value.toString();
    });

    console.log('Received ITN:', itnData);

    // Step 1: Validate source IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    // Note: In production, uncomment this validation
    // if (!validatePayfastIP(clientIp)) {
    //   console.error('Invalid IP:', clientIp);
    //   return NextResponse.json({ error: 'Invalid source' }, { status: 403 });
    // }

    // Step 2: Validate signature
    const config = getPayfastConfig();
    const providedSignature = itnData.signature;
    delete itnData.signature; // Remove signature before validation

    if (!validateSignature(itnData, config.passphrase, providedSignature)) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Step 3: Extract payment information
    const paymentStatus = itnData.payment_status;
    const userId = itnData.custom_str1;
    const payfastPaymentId = itnData.pf_payment_id;
    const amount = parseFloat(itnData.amount_gross);
    const token = itnData.token; // For subscriptions

    console.log('Payment Status:', paymentStatus);
    console.log('User ID:', userId);
    console.log('Token:', token);

    if (!userId) {
      console.error('No user ID provided in payment');
      return new NextResponse('OK', { status: 200 });
    }

    // Step 4: Get Convex client
    const convex = await getConvexClient();

    if (!convex) {
      console.error('Convex not configured, skipping database updates');
      return new NextResponse('OK', { status: 200 });
    }

    // Step 5: Process payment based on status
    if (paymentStatus === 'COMPLETE') {
      console.log('Payment completed successfully');
      
      try {
        // Create/update payment record
        const paymentId = await convex.client.mutation(convex.api.payments.createPayment, {
          userId,
          payfastPaymentId,
          amount,
          currency: 'ZAR',
          status: 'complete',
          payfastData: itnData,
        });

        console.log('Payment record created:', paymentId);

        // If this is a subscription payment (has token), create/update subscription
        if (token) {
          // Determine plan based on amount: R25,000 = enterprise, R15,000 = premium
          const plan = amount >= 20000 ? 'enterprise' : 'premium';
          const monthlyMinutes = plan === 'enterprise' ? -1 : 10000; // -1 = unlimited
          
          console.log('Creating subscription for plan:', plan);

          // For enterprise plans, create organization if it doesn't exist
          let organizationId = null;
          if (plan === 'enterprise') {
            try {
              // Generate organization slug from user email or ID
              const orgSlug = `org-${userId.substring(0, 8)}-${Date.now()}`;
              const orgDomain = `${orgSlug}.concierge.ai`;

              console.log('Creating enterprise organization:', orgSlug);

              // Create organization
              const orgResult = await convex.client.mutation(
                convex.api.organizations.createOrganization,
                {
                  name: `${itnData.name_first || 'Enterprise'} Organization`,
                  slug: orgSlug,
                  domain: orgDomain,
                  ownerId: userId,
                  subscriptionTier: 'enterprise',
                  billingEmail: itnData.email_address || `${userId}@example.com`,
                }
              );

              organizationId = orgResult.organizationId;
              console.log('Organization created:', organizationId);

              // Store organization ID in localStorage for demo (in production, use proper auth)
              if (typeof window !== 'undefined') {
                localStorage.setItem('demo_org_id', organizationId);
              }
            } catch (orgError) {
              console.error('Error creating organization:', orgError);
              // Continue with subscription creation even if organization fails
            }
          }
          
          const subscriptionId = await convex.client.mutation(
            convex.api.payments.createOrUpdateSubscription,
            {
              userId,
              organizationId,
              plan,
              status: 'active',
              monthlyMinutes,
              price: amount,
              currency: 'ZAR',
              payfastToken: token,
              payfastSubscriptionId: itnData.m_payment_id,
              payfastStatus: paymentStatus,
            }
          );

          console.log('Subscription created/updated:', subscriptionId);
        }

        console.log('Database updates completed successfully');
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still return 200 to prevent Payfast retries
      }
    } else if (paymentStatus === 'CANCELLED') {
      console.log('Payment cancelled by user');
      
      try {
        await convex.client.mutation(convex.api.payments.createPayment, {
          userId,
          payfastPaymentId,
          amount,
          currency: 'ZAR',
          status: 'cancelled',
          payfastData: itnData,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    } else if (paymentStatus === 'FAILED') {
      console.error('Payment failed');
      
      try {
        await convex.client.mutation(convex.api.payments.createPayment, {
          userId,
          payfastPaymentId,
          amount,
          currency: 'ZAR',
          status: 'failed',
          payfastData: itnData,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    // Step 6: Respond to Payfast (must return 200 OK)
    return new NextResponse('OK', { status: 200 });
    
  } catch (error) {
    console.error('ITN processing error:', error);
    
    // Still return 200 to prevent Payfast retries on our errors
    return new NextResponse('OK', { status: 200 });
  }
}

// Allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payfast webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
