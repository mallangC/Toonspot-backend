import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Role} from "../type/user.type";
import {ROLES_KEY} from "../decorators/user.roles.decorator";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";

@Injectable()
export class RoleGuard implements CanActivate{
  constructor(private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user.role?.includes(role));
    if (!hasRole) {
      throw new CustomException(ExceptionCode.UNAUTHORIZED);
    }

    return true;
  }

}