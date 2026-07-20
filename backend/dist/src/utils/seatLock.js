export const acquireSeatLock = async (key, ttlSeconds = 30) => {
    return {
        key,
        ttlSeconds,
        locked: true,
    };
};
