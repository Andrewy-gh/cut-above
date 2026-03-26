import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'America/New_York';

export type MinuteRange = { startMinute: number; endMinute: number };

export type SeedClient = {
  email: string;
};

export type SeedSlot = {
  start: string;
  end: string;
};

const toLocalMinute = (iso: string) => {
  const local = dayjs.utc(iso).tz(TZ);
  return local.hour() * 60 + local.minute();
};

const rotateIndex = (length: number, offset: number, index: number) => (offset + index) % length;

export const hasRangeOverlap = (existingRanges: MinuteRange[], candidate: MinuteRange) =>
  existingRanges.some(
    (range) => candidate.startMinute < range.endMinute && candidate.endMinute > range.startMinute
  );

export const toMinuteRange = (slot: SeedSlot): MinuteRange => ({
  startMinute: toLocalMinute(slot.start),
  endMinute: toLocalMinute(slot.end),
});

export const getClientBookingKey = (date: string, clientId: string) => `${date}:${clientId}`;

export const getEmployeeBookingKey = (date: string, employeeId: string) => `${date}:${employeeId}`;

export const pickSeedSlot = (
  slots: SeedSlot[],
  existingRanges: MinuteRange[],
  earliestMinute: number,
  rand: () => number
) => {
  const candidates = slots
    .map((slot) => ({ slot, range: toMinuteRange(slot) }))
    .filter(
      ({ range }) => range.startMinute >= earliestMinute && !hasRangeOverlap(existingRanges, range)
    );

  if (candidates.length === 0) {
    return null;
  }

  const selectionWindow = Math.min(4, candidates.length);
  const selectedIndex = Math.floor(rand() * selectionWindow);
  return candidates[selectedIndex];
};

export const pickClientForSeedSlot = (input: {
  clients: SeedClient[];
  userMap: Map<string, string>;
  date: string;
  candidateRange: MinuteRange;
  clientBookingsByDay: Map<string, MinuteRange[]>;
  rand: () => number;
}) => {
  const { clients, userMap, date, candidateRange, clientBookingsByDay, rand } = input;
  if (clients.length === 0) {
    return null;
  }

  const startOffset = Math.floor(rand() * clients.length);
  const unusedToday: Array<{ client: SeedClient; clientId: string }> = [];
  const reusableToday: Array<{ client: SeedClient; clientId: string }> = [];

  for (let index = 0; index < clients.length; index += 1) {
    const client = clients[rotateIndex(clients.length, startOffset, index)];
    const clientId = userMap.get(client.email);
    if (!clientId) continue;

    const bookingKey = getClientBookingKey(date, clientId);
    const existingBookings = clientBookingsByDay.get(bookingKey) ?? [];
    if (hasRangeOverlap(existingBookings, candidateRange)) {
      continue;
    }

    if (existingBookings.length === 0) {
      unusedToday.push({ client, clientId });
      continue;
    }

    reusableToday.push({ client, clientId });
  }

  return unusedToday[0] ?? reusableToday[0] ?? null;
};
