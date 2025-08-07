const NodeCache = require('node-cache');

// Cache configuration
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600; // Default 1 hour
const CACHE_PREFIX = process.env.CACHE_PREFIX || 'student_accommodation_';
const ENABLE_CACHING = process.env.ENABLE_CACHING === 'true';

// Initialize cache
const cache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: CACHE_TTL * 0.2, // Check for expired keys every 20% of TTL
  useClones: false // Store references instead of cloning objects
});

// Routes that should not be cached
const CACHE_BLACKLIST = [
  '/api/users/profile',
  '/api/accommodations/my-accommodations',
  '/api/payments/history'
];

// Routes that should always be cached
const CACHE_WHITELIST = [
  '/api/accommodations',
  '/api/accommodations/:id',
  '/api/reviews',
  '/api/advertisements'
];

const cacheMiddleware = (req, res, next) => {
  // Skip if caching is disabled
  if (!ENABLE_CACHING) {
    return next();
  }

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const path = req.originalUrl;

  // Check blacklist
  if (CACHE_BLACKLIST.some(route => path.startsWith(route))) {
    console.log(`[Cache] Skipping blacklisted route: ${path}`);
    return next();
  }

  // Check whitelist if not in blacklist
  if (!CACHE_WHITELIST.some(route => {
    const pattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
    return pattern.test(path);
  })) {
    console.log(`[Cache] Skipping non-whitelisted route: ${path}`);
    return next();
  }

  const key = `${CACHE_PREFIX}${path}`;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`[Cache] Hit for ${path}`);
    return res.json(cachedResponse);
  }

  // If not cached, patch res.json to cache the response
  const originalJson = res.json;
  res.json = function(body) {
    cache.set(key, body);
    console.log(`[Cache] Miss for ${path}, cached new response`);
    return originalJson.call(this, body);
  };

  next();
};

// Cache invalidation middleware
const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
      console.log(`[Cache] Invalidated key: ${key}`);
    }
  });
};

// Export both middleware and invalidation function
module.exports = {
  cacheMiddleware,
  invalidateCache
};