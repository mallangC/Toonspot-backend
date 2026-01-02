const DAY_MAP = new Map<string, string>([
  ['mon', '월'],
  ['tue', '화'],
  ['wed', '수'],
  ['thu', '목'],
  ['fri', '금'],
  ['sat', '토'],
  ['sun', '일'],
  ['finish', '완결'],
  ['complete', '완결'],
  ['1', '월'],
  ['2', '화'],
  ['3', '수'],
  ['4', '목'],
  ['5', '금'],
  ['6', '토'],
  ['7', '일'],
  ['12', '완결'],
]);

export function changeDay(day: string) {
    return DAY_MAP.get(day) || 'not found';
}