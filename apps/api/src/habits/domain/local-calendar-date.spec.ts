import { localCalendarDate } from './local-calendar-date.js';

describe('localCalendarDate', () => {
  it('changes the stored calendar date at midnight in Jakarta', () => {
    expect(
      localCalendarDate('Asia/Jakarta', new Date('2026-09-03T16:59:59.000Z')),
    ).toEqual(new Date('2026-09-03T00:00:00.000Z'));

    expect(
      localCalendarDate('Asia/Jakarta', new Date('2026-09-03T17:00:00.000Z')),
    ).toEqual(new Date('2026-09-04T00:00:00.000Z'));
  });

  it('keeps the previous calendar date for a user west of UTC', () => {
    expect(
      localCalendarDate(
        'America/Los_Angeles',
        new Date('2026-09-03T06:59:59.000Z'),
      ),
    ).toEqual(new Date('2026-09-02T00:00:00.000Z'));
  });
});
