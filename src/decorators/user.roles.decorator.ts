import { SetMetadata } from '@nestjs/common';
import {Role} from "../type/user.type";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);