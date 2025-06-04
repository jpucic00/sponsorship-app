// frontend/src/utils/dateUtils.ts

export const formatDateTime = (dateString: string | Date, includeSeconds: boolean = false): string => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour format
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleDateString('en-GB', options).replace(',', ' at');
};

export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (dateString: string | Date, includeSeconds: boolean = false): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleTimeString('en-GB', options);
};

export const formatRelativeTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return formatDateTime(date);
  }
};

export const formatDateTimeWithRelative = (dateString: string | Date): { 
  formatted: string; 
  relative: string;
  full: string;
} => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return {
      formatted: 'Invalid date',
      relative: 'Invalid date',
      full: 'Invalid date'
    };
  }

  return {
    formatted: formatDateTime(date),
    relative: formatRelativeTime(date),
    full: formatDateTime(date, true)
  };
};