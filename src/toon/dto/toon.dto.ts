import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";

export interface ToonDto {
  platformId: number,
  title: string,
  isAdult: boolean,
  authors: string,
  imageUrl: string,
  pageUrl: string,
  rating?: number | null,
  publishDays: string,
  summary: string | null,
  genre: ToonGenre | null,
  status: ToonStatus,
  totalEpisode: number | null,
  provider: ToonProvider,
  isActive: boolean
}