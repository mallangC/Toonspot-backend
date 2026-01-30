import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";

export class ToonResponse {
  id: number
  platformId: number
  title: string
  isAdult: boolean
  authors: string
  imageUrl: string
  pageUrl: string
  rating: number | null
  publishDays: string
  summary: string | null
  genre: ToonGenre | null
  status: ToonStatus
  totalEpisode: number | null
  provider: ToonProvider
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}