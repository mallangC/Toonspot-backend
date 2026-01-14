import {UserRole, UserStatus} from "@prisma/client";

export class UserResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}