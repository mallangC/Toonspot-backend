import {ToonDto} from "../toon/dto/toon.dto";
import {changeDay} from "./change.day";

export async function mergeSeedToons(
    days: string[],
    fetcher: (day: string) => Promise<ToonDto[] | null>
): Promise<ToonDto[]> {
  const webtoonMap = new Map<string, ToonDto>();

  for (const day of days) {
    const results = await fetcher(day);
    if (!results) {
      continue;
    }

    for (const toon of results) {
      if (webtoonMap.has(toon.title)) {
        const existingToon = webtoonMap.get(toon.title)!;
        if (!existingToon.publishDays.includes(day)) {
          existingToon.publishDays = `${existingToon.publishDays} ${day}`;
        }
      } else {
        webtoonMap.set(toon.title, {...toon, publishDays: day});
      }
    }
  }
  return Array.from(webtoonMap.values()).map(toon => ({
    ...toon,
    publishDays: toon.publishDays
        .split(' ')
        .map(d => changeDay(d))
        .join(', ')
  }));
}