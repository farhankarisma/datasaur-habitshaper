export function localCalendarDate(
  timezone: string,
  now: Date = new Date(),
): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)!.value;

  return new Date(
    Date.UTC(
      Number(part('year')),
      Number(part('month')) - 1,
      Number(part('day')),
    ),
  );
}
