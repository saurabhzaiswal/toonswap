import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/auth.types';
import { GenerationPolicyService } from './generation-policy.service';

@Injectable()
export class GenerationPolicyGuard implements CanActivate {
  constructor(private readonly policy: GenerationPolicyService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    await this.policy.assertAllowed(request.user);
    return true;
  }
}
