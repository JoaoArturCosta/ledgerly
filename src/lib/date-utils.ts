/**
 * Creates a date set to noon local time to avoid timezone conversion issues
 * when sending dates to the backend via tRPC
 */
export function createTimezoneNeutralDate(
  year: number,
  month: number,
  day: number = 1,
): Date {
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Converts any date to noon local time to avoid timezone issues
 */
export function toTimezoneNeutralDate(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
  );
}

/**
 * Gets current date set to noon to avoid timezone issues
 */
export function getCurrentTimezoneNeutralDate(): Date {
  const today = new Date();
  return createTimezoneNeutralDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
}

/**
 * Gets first day of current month set to noon to avoid timezone issues
 */
export function getCurrentMonthTimezoneNeutralDate(): Date {
  const today = new Date();
  return createTimezoneNeutralDate(today.getFullYear(), today.getMonth(), 1);
}
