export const BILLING_PROVIDER = 'BILLING_PROVIDER';

export interface IBillingProvider {
  createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string>,
  ): Promise<{ id: string }>;

  createCheckoutSession(
    customerId: string,
    priceId: string,
    urls: { success: string; cancel: string },
  ): Promise<{ url: string }>;

  createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;

  constructWebhookEvent(rawBody: Buffer, signature: string): any;

  fetchSubscription(subscriptionId: string): Promise<any>;
}
