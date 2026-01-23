import {PostStatus} from "@prisma/client";

export class PostResponse {
  id: number;
  userId: number;
  toonId: number;
  title: string;
  content: string;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}