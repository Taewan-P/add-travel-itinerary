function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function isoToLocalDateTimeInputValue(value: string): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = pad2(parsed.getMonth() + 1);
  const day = pad2(parsed.getDate());
  const hours = pad2(parsed.getHours());
  const minutes = pad2(parsed.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function localDateTimeInputValueToIso(value: string): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = pad2(parsed.getMonth() + 1);
  const day = pad2(parsed.getDate());
  const hours = pad2(parsed.getHours());
  const minutes = pad2(parsed.getMinutes());
  const seconds = pad2(parsed.getSeconds());

  const offsetMinutes = -parsed.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = pad2(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetRemainderMinutes = pad2(Math.abs(offsetMinutes) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainderMinutes}`;
}
