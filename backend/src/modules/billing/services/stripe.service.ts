import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IBillingProvider } from '../interfaces/billing-provider.interface';

@Injectable()
export class StripeService implements IBillingProvider {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('billing.stripeSecretKey', ''),
    );
    this.webhookSecret = this.configService.get<string>(
      'billing.stripeWebhookSecret',
      '',
    );
  }

  async createCustomer(
    email: string,
    name: string,
    metadata: Record<string, string>,
  ): Promise<{ id: string }> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
    this.logger.log(`Stripe customer created: ${customer.id}`);
    return { id: customer.id };
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    urls: { success: string; cancel: string },
  ): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: urls.success,
      cancel_url: urls.cancel,
    });
    return { url: session.url! };
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): any {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );
  }

  async fetchSubscription(subscriptionId: string): Promise<any> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
}
