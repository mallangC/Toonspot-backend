import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class MockAuthGuard implements CanActivate{
  public static mockUser: any = null;

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (MockAuthGuard.mockUser){
      req.user = MockAuthGuard.mockUser;
    }
    return true;
  }
}