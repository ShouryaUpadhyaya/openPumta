import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // After 3 retries, stop trying and log a warning instead of spamming errors
      if (retries >= 3) {
        console.warn('[Redis] Not available — running without cache. Set REDIS_URL to enable.');
        return false; // stop reconnecting
      }
      return Math.min(retries * 500, 2000);
    },
  },
});

redisClient.on('connect', () => {
  console.log('Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('error', () => {
  // Silenced — reconnectStrategy handles the messaging
});

redisClient.on('reconnecting', () => {
  // Silenced — reconnectStrategy handles the messaging
});

export let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    redisAvailable = true;
  } catch {
    console.warn('[Redis] Could not connect — server will run without caching.');
    redisAvailable = false;
  }
}
