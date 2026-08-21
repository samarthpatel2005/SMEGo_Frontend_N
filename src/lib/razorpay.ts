// Razorpay configuration
import { createPaymentOrder, verifyPayment } from '@/services/paymentService'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const razorpay = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
}

// Razorpay payment options interface
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Helper function to format price for display (in INR)
// Price comes from database in rupees, no conversion needed
export const formatPrice = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

// Helper function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Helper function to initiate Razorpay payment
export const initiateRazorpayPayment = async (
  planId: string,
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  },
  isRegistration: boolean = false
): Promise<RazorpayResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order using payment service
      const orderData = await createPaymentOrder(planId, isRegistration);

      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'SMEGo',
        description: `Subscription for ${orderData.order.planName}`,
        order_id: orderData.order.id,
        handler: (response: RazorpayResponse) => {
          resolve(response);
        },
        prefill: userDetails,
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        reject(new Error(`Payment failed: ${response.error.description}`));
      });

      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to verify payment
export const verifyRazorpayPayment = async (
  paymentData: RazorpayResponse,
  planId: string,
  isRegistration: boolean = false
) => {
  try {
    const response = await verifyPayment({
      ...paymentData,
      planId
    }, isRegistration);
    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

