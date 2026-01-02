import {ToonGenre} from "@prisma/client";

const GenreMap: Record<string, ToonGenre> = {
  "무협": ToonGenre.WUXIA,
  "로맨스": ToonGenre.ROMANCE,
  "스릴러": ToonGenre.THRILLER,
  "액션": ToonGenre.ACTION,
  "일상": ToonGenre.DAILY,
  "개그": ToonGenre.COMEDY,
  "판타지": ToonGenre.FANTASY,
  "드라마": ToonGenre.DRAMA,
  "스포츠": ToonGenre.SPORTS,
  "감성": ToonGenre.EMOTION,
  "로판": ToonGenre.ROMANCE_FANTASY,
  "로맨스 판타지": ToonGenre.ROMANCE_FANTASY,
  "BL": ToonGenre.BL
};

export function mapGenreToEnum(genreString: string | null): ToonGenre | null {
  if (!genreString) return null;
  for (const koreanGenre in GenreMap) {
    if (genreString.includes(koreanGenre)) {
      return GenreMap[koreanGenre];
    }
  }
  return null;
}