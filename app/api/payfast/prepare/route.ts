import { NextRequest, NextResponse } from 'next/server';
import { getPayfastConfig, preparePaymentData, getPayfastUrl } from '@/lib/payfast';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      amount,
      itemName,
      itemDescription,
      userId,
      subscriptionType,
      frequency,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !amount || !itemName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Payfast configuration
    const config = getPayfastConfig();

    // Prepare payment data
    const paymentData = preparePaymentData(config, {
      firstName,
      lastName,
      email,
      amount,
      itemName,
      itemDescription,
      userId,
      subscriptionType,
      frequency,
    });

    // Return payment data and Payfast URL
    return NextResponse.json({
      formData: paymentData,
      payfastUrl: getPayfastUrl(config.isSandbox),
    });
  } catch (error) {
    console.error('Payment preparation error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare payment' },
      { status: 500 }
    );
  }
}
