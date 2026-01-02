import {Prisma} from "@prisma/client";

type UserSelect = Prisma.UserSelect
type ToonSelect = Prisma.ToonSelect

export const USER_SAFE_SELECT: UserSelect = {
  id: true,
  nickname: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  role: true,
}

export const TOON_SELECT: ToonSelect = {
  id: true,
  toonId: true,
  provider: true,
  title: true,
  authors: true,
  summary: true,
  genre: true,
  rating: true,
  status: true,
  isAdult: true,
  isActive: true,
  imageUrl: true,
  pageUrl: true,
  totalEpisode: true,
  publishDays: true,
  createdAt: true,
  updatedAt: true,
}