import {ToonProvider, ToonStatus} from "@prisma/client";

export interface ToonUpdate {
  platformId: number;
  title: string;
  status: ToonStatus;
  publishDays: string;
  totalEpisode: number | null;
  provider: ToonProvider;
  rating?: number;
}