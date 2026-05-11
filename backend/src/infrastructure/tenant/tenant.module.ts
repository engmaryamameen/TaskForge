import { Module, Global } from '@nestjs/common';
import { TenantTransactionInterceptor } from './tenant-transaction.interceptor';

@Global()
@Module({
  providers: [TenantTransactionInterceptor],
  exports: [TenantTransactionInterceptor],
})
export class TenantModule {}
