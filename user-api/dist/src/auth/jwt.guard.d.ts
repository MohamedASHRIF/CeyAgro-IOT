import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtGuard implements CanActivate {
    private authorizeMiddleware;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
