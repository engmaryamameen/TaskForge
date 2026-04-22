import { registerAs } from '@nestjs/config';

export default registerAs('billing', () => ({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceIdPro: process.env.STRIPE_PRICE_ID_PRO || '',
  stripePriceIdEnterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  gracePeriodDays: 7,
}));
