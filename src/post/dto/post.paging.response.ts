import {PostResponse} from "./post.response";

export class PostPagingResponse {
  items: PostResponse[]
  metadata: {
    totalCount: number
    totalPages: number
    currentPage: number
  }
}