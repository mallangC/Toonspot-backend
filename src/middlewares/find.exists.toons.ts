import {PrismaClient, ToonProvider} from "@prisma/client";

const prisma = new PrismaClient;

export function findExistsToons(provider: ToonProvider) {
  return prisma.toon.findMany({
    where: {provider},
    select: {
      toonId: true,
      title: true,
      status: true,
      totalEpisode: true,
      rating: true,
      genre: true
    },
  });
}