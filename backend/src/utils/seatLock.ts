export const acquireSeatLock = async (key: string, ttlSeconds = 30) => {
  return {
    key,
    ttlSeconds,
    locked: true,
  };
};
