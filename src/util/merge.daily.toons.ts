import {ToonDto} from "../toon/dto/toon.dto";
import {changeDay} from "./change.day";
import {SyncResult} from "../toon/interface/interface.syncresult";
import {ToonUpdate} from "../toon/interface/interface.toon.update";

export async function mergeDailyToons(
    days: string[],
    fetcher: (day: string) => Promise<SyncResult | null>
): Promise<SyncResult> {
  const createMap = new Map<string, ToonDto>();
  const updateMap = new Map<string, ToonUpdate>();

  for (const day of days) {
    const results = await fetcher(day);
    if (!results) {
      continue;
    }

    for (const toon of results.createData) {
      if (createMap.has(toon.title)) {
        const existingToon = createMap.get(toon.title)!;
        if (!existingToon.publishDays.includes(day)) {
          existingToon.publishDays = `${existingToon.publishDays} ${day}`;
        }
      } else {
        createMap.set(toon.title, {...toon, publishDays: day});
      }
    }
    for (const toon of results.updateData) {
      if (!updateMap.has(toon.title)) {
        updateMap.set(toon.title, {...toon});
      }
    }
  }

  const createData = Array.from(createMap.values()).map(toon => ({
    ...toon,
    publishDays: toon.publishDays
        .split(' ')
        .map(d => changeDay(d))
        .join(', ')
  }))
  const updateData = Array.from(updateMap.values());

  return {createData, updateData};
}