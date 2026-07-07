import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  console.log('Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});
