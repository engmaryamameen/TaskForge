import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CacheInvalidationListener } from './cache-invalidation.listener';
import { CACHE_SERVICE } from './cache.interface';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: RedisCacheService,
    },
    CacheInvalidationListener,
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
