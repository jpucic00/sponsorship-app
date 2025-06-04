/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2023, 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date string to just the date (no time)
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "January 15, 2023")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      const suffix = count === 1 ? '' : 's';
      const timeWord = diffInSeconds > 0 ? 'ago' : 'from now';
      return `${count} ${interval.label}${suffix} ${timeWord}`;
    }
  }

  return 'just now';
};

/**
 * Format date with relative time
 * @param dateString ISO date string
 * @returns Object with formatted date and relative time
 */
export const formatDateTimeWithRelative = (dateString: string) => {
  return {
    formatted: formatDateTime(dateString),
    relative: getRelativeTime(dateString),
  };
};