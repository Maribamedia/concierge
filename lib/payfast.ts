/**
 * Payfast Integration Utilities
 * Handles signature generation, validation, and API interactions
 */

import crypto from 'crypto';

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  isSandbox?: boolean;
}

export interface PayfastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  // Item details
  item_name: string;
  item_description?: string;
  amount: number;
  // Subscription fields
  subscription_type?: '1'; // 1 = subscription
  billing_date?: string; // YYYY-MM-DD
  recurring_amount?: number;
  frequency?: '3' | '6'; // 3 = Monthly, 6 = Annual
  cycles?: number; // 0 = until cancelled
  // Custom fields
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: number;
  custom_int2?: number;
}

export interface PayfastITNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: string;
  custom_int2?: string;
  name_first: string;
  name_last: string;
  email_address: string;
  merchant_id: string;
  token?: string;
  billing_date?: string;
  signature: string;
}

/**
 * Get Payfast configuration from environment
 */
export function getPayfastConfig(): PayfastConfig {
  const isSandbox = process.env.PAYFAST_ENV !== 'production';
  
  return {
    merchantId: isSandbox ? '10000100' : process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: isSandbox ? '46f0cd694581a' : process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: isSandbox ? 'jt7NOE43FZPn' : process.env.PAYFAST_PASSPHRASE || '',
    isSandbox,
  };
}

/**
 * Get Payfast API URL based on environment
 */
export function getPayfastUrl(isSandbox: boolean = false): string {
  return isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

/**
 * Generate MD5 signature for Payfast payment
 */
export function generateSignature(
  data: Record<string, string | number | undefined>,
  passphrase: string
): string {
  // Create parameter string
  let paramString = '';
  const sortedKeys = Object.keys(data).sort();
  
  for (const key of sortedKeys) {
    const value = data[key];
    if (value !== undefined && value !== '' && key !== 'signature') {
      paramString += `${key}=${encodeURIComponent(String(value))}&`;
    }
  }
  
  // Remove trailing ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase)}`;
  }
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(paramString).digest('hex');
}

/**
 * Validate Payfast ITN signature
 */
export function validateSignature(
  itnData: Record<string, string | number | undefined>,
  passphrase: string,
  providedSignature: string
): boolean {
  const calculatedSignature = generateSignature(itnData, passphrase);
  return calculatedSignature === providedSignature;
}

/**
 * Validate Payfast ITN from IP address
 */
export function validatePayfastIP(ipAddress: string): boolean {
  const validIPs = [
    '197.97.145.144',
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
    '197.97.145.145',
    // Sandbox IPs
    '41.74.179.210',
    '41.74.179.211',
  ];
  
  return validIPs.includes(ipAddress);
}

/**
 * Verify payment amount
 */
export function verifyPaymentAmount(
  itnAmount: string,
  expectedAmount: number
): boolean {
  const itnAmountNum = parseFloat(itnAmount);
  return Math.abs(itnAmountNum - expectedAmount) < 0.01;
}

/**
 * Prepare payment data for Payfast form
 */
export function preparePaymentData(
  config: PayfastConfig,
  paymentDetails: {
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    itemName: string;
    itemDescription?: string;
    userId?: string;
    subscriptionType?: boolean;
    frequency?: '3' | '6'; // 3 = Monthly, 6 = Annual
  }
): PayfastPaymentData & { signature: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const paymentData: PayfastPaymentData = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${baseUrl}/billing/success`,
    cancel_url: `${baseUrl}/billing/cancel`,
    notify_url: `${baseUrl}/api/payfast/webhook`,
    name_first: paymentDetails.firstName,
    name_last: paymentDetails.lastName,
    email_address: paymentDetails.email,
    item_name: paymentDetails.itemName,
    item_description: paymentDetails.itemDescription,
    amount: paymentDetails.amount,
  };
  
  // Add subscription fields if applicable
  if (paymentDetails.subscriptionType) {
    paymentData.subscription_type = '1';
    paymentData.recurring_amount = paymentDetails.amount;
    paymentData.frequency = paymentDetails.frequency || '3'; // Default to monthly
    paymentData.cycles = 0; // Until cancelled
    
    // Set billing date to today
    const today = new Date();
    paymentData.billing_date = today.toISOString().split('T')[0];
  }
  
  // Add custom fields
  if (paymentDetails.userId) {
    paymentData.custom_str1 = paymentDetails.userId;
  }
  
  // Generate signature
  const signature = generateSignature(paymentData as any, config.passphrase);
  
  return {
    ...paymentData,
    signature,
  };
}

/**
 * Format amount to ZAR currency
 */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert USD to ZAR (1 USD = 15 ZAR)
 */
export function convertUSDtoZAR(usdAmount: number): number {
  return Math.round(usdAmount * 15);
}
