const PROJECT_TIME_ZONE = 'Europe/Rome';

type ObservationDateTime = {
  observedDate: string;
  observedTime?: string;
  timeUnknown: boolean;
};

export function getDefaultObservationDateTime(now = new Date()) {
  const parts = getZonedParts(now);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`
  };
}

export function toObservationTimestamp(values: ObservationDateTime) {
  const time = values.timeUnknown || !values.observedTime ? '12:00' : values.observedTime;
  const [year, month, day] = values.observedDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);

  let offsetMinutes = getOffsetMinutes(new Date(utcGuess));
  let instant = new Date(utcGuess - offsetMinutes * 60_000);
  const correctedOffset = getOffsetMinutes(instant);
  if (correctedOffset !== offsetMinutes) {
    offsetMinutes = correctedOffset;
    instant = new Date(utcGuess - offsetMinutes * 60_000);
  }

  return `${values.observedDate}T${time}:00${formatOffset(getOffsetMinutes(instant))}`;
}

function getOffsetMinutes(instant: Date) {
  const parts = getZonedParts(instant);
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute)
  );
  return Math.round((zonedAsUtc - instant.getTime()) / 60_000);
}

function getZonedParts(instant: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PROJECT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(instant);

  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
}

function formatOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}
