import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from '../services/billing.service';
import { StripeService } from '../services/stripe.service';
import { Public } from '../../../common/decorators/public.decorator';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('billing/webhooks')
export class WebhookController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}

  @Public()
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new AppError(
        ErrorCodes.WEBHOOK_SIGNATURE_INVALID,
        'Missing raw body for webhook verification',
        400,
      );
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new AppError(
        ErrorCodes.WEBHOOK_SIGNATURE_INVALID,
        'Invalid webhook signature',
        400,
      );
    }

    await this.billingService.handleWebhookEvent(event);
    return { received: true };
  }
}
