// roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import {Role} from "../type/user.type";

export const ROLES_KEY = 'roles';
// 필요한 역할을 배열로 받아 메타데이터로 설정합니다.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);