import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Always run the passport strategy so a valid token populates req.user even
    // on public routes (enables optional auth → likedByMe / isMember flags).
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser, _info: unknown, context: ExecutionContext): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Public routes: attach the user if present, but never reject.
    if (isPublic) return (user ?? undefined) as TUser;
    // Protected routes: require a valid authenticated user.
    if (err || !user) throw err instanceof Error ? err : new UnauthorizedException();
    return user;
  }
}
