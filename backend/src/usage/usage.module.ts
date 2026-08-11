import { Module } from '@nestjs/common';
import { GenerationPolicyGuard } from './generation-policy.guard';
import { GenerationPolicyService } from './generation-policy.service';

@Module({
  providers: [GenerationPolicyService, GenerationPolicyGuard],
  exports: [GenerationPolicyService, GenerationPolicyGuard],
})
export class UsageModule {}
