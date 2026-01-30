import {UserRole, UserStatus} from "@prisma/client";
import {ApiProperty} from "@nestjs/swagger";

export class UserResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  status: UserStatus;
  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER
  })
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}