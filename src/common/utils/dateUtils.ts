/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  const date = new Date();
  return formatDateToYYYYMMDD(date);
};

/**
 * Format a Date object to YYYY-MM-DD string
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD string to a Date object (local timezone)
 */
export const parseDateFromYYYYMMDD = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a YYYY-MM-DD string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseDateFromYYYYMMDD(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
