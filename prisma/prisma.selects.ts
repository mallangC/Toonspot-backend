import {Prisma} from "@prisma/client";

type UserSelect = Prisma.UserSelect

export const USER_SAFE_SELECT: UserSelect = {
  id: true,
  nickname: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
}