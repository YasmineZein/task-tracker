// Utility function to calculate time difference in a human-readable format
export const getTimeSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now - then;
  
  // Convert to different units
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInWeek = Math.floor(diffInDay / 7);
  const diffInMonth = Math.floor(diffInDay / 30);
  const diffInYear = Math.floor(diffInDay / 365);

  if (diffInSec < 60) {
    return 'Just now';
  } else if (diffInMin < 60) {
    return diffInMin === 1 ? '1 minute ago' : `${diffInMin} minutes ago`;
  } else if (diffInHour < 24) {
    return diffInHour === 1 ? '1 hour ago' : `${diffInHour} hours ago`;
  } else if (diffInDay === 1) {
    return 'Yesterday';
  } else if (diffInDay < 7) {
    return `${diffInDay} days ago`;
  } else if (diffInWeek < 4) {
    return diffInWeek === 1 ? '1 week ago' : `${diffInWeek} weeks ago`;
  } else if (diffInMonth < 12) {
    return diffInMonth === 1 ? '1 month ago' : `${diffInMonth} months ago`;
  } else {
    return diffInYear === 1 ? '1 year ago' : `${diffInYear} years ago`;
  }
};

// Format date to a readable format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
