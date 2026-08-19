export const BASE_CONNECTION_POINTS = 10;

export function getFeedbackPoints(rating) {
  if (rating <= 2) return 0;
  if (rating === 3) return 5;
  if (rating === 4) return 10;
  if (rating === 5) return 20;
  return 0;
}
