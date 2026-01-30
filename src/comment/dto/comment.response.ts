import {CommentStatus} from "@prisma/client";

export class CommentResponse {
  id: number;
  userId: number;
  postId: number;
  content: string;
  status: CommentStatus;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean;
  likes?: any[];
}