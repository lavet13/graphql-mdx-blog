export const parseIntSafe = (value: string): number | null => {
  if(/^(\d+)$/.test(value)) {
    return parseInt(value, 10);
  }

  return null;
};
