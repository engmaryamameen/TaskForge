import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Use userId when authenticated, fall back to IP for public routes.
   * Per-user tracking prevents penalizing users behind corporate NATs.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.userId ?? req.ip ?? 'unknown';
  }

  /**
   * Skip rate limiting for WebSocket upgrade requests.
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();
    if (type === 'ws') return true;
    return false;
  }
}
