export const applyRoomMaintenance =
  (rooms: number) =>
    Math.floor(rooms * 0.8);

export const overwriteADR = (
  high: number,
  shoulder: number,
  low: number
) => {
  if (high === shoulder && shoulder === low) {
    return {
      high: high * 1.1,
      shoulder: shoulder * 1.05,
      low
    };
  }
  return { high, shoulder, low };
};

export const clamp = (
  v: number,
  min: number,
  max: number
) => Math.min(Math.max(v, min), max);
