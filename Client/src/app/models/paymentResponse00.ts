// paymentResponse.ts
export interface PaymentResponse {
  success: boolean;
  charge: {
    id: string;
    amount: number;
    status: string;
    // Add other Stripe fields if needed
  };
  paymentRecord: {
    _id: string;
    userId: string;
    orderId: string;
    amount: number;
    stripeChargeId: string;
    status: string;
    createdAt: string;
  };
}
