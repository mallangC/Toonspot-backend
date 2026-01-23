import {Prisma} from "@prisma/client";

type UserSelect = Prisma.UserSelect
type ToonSelect = Prisma.ToonSelect
type PostSelect = Prisma.PostSelect
type CommentSelect = Prisma.CommentSelect

export const USER_SAFE_SELECT: UserSelect = {
  id: true,
  nickname: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}

export const TOON_SELECT: ToonSelect = {
  id: true,
  platformId: true,
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

export const POST_SELECT: PostSelect = {
  id: true,
  toonId: true,
  userId: true,
  title: true,
  content: true,
  status: true,
  viewCount: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
}

export const COMMENT_SELECT: CommentSelect = {
  id: true,
  userId: true,
  postId: true,
  status: true,
  content: true,
  likeCount: true,
  createdAt: true,
  updatedAt: true,
}