export const toSecs = (time: string) => {
  const parts = time.split(':').map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

export const fmt = (seconds: number) =>
  [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');

export const sortKey = (date: string) => date.slice(6) + date.slice(3, 5) + date.slice(0, 2);
