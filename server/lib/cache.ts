/**
 * Caching layer for ContractClarity
 * Provides Redis-based caching with fallback to in-memory cache
 */

import { storage } from '../storage';

// Simple in-memory cache as fallback
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expires });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Redis cache implementation (when Redis is available)
class RedisCache {
  private redis: any = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Only try to connect if Redis URL is provided
      if (!process.env.REDIS_URL) {
        console.log('📦 Redis URL not provided, using memory cache');
        return;
      }

      // Dynamically import Redis to avoid errors if not installed
      const Redis = await import('ioredis').catch(() => null);
      if (!Redis) {
        console.log('📦 Redis package not installed, using memory cache');
        return;
      }

      this.redis = new Redis.default(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error: Error) => {
        console.warn('⚠️ Redis connection error:', error.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('📦 Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.redis.ping();
      this.isConnected = true;
    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<any> {
    if (!this.isConnected || !this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('⚠️ Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.isConnected || !this.redis) return;
    
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.warn('⚠️ Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.warn('⚠️ Redis del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('⚠️ Redis exists error:', error);
      return false;
    }
  }
}

// Cache manager that handles both Redis and memory cache
class CacheManager {
  private redisCache: RedisCache;
  private memoryCache: MemoryCache;

  constructor() {
    this.redisCache = new RedisCache();
    this.memoryCache = new MemoryCache();
  }

  async get(key: string): Promise<any> {
    // Try Redis first, fallback to memory cache
    let value = await this.redisCache.get(key);
    if (value !== null) return value;
    
    return await this.memoryCache.get(key);
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    // Set in both caches
    await Promise.all([
      this.redisCache.set(key, value, ttlSeconds),
      this.memoryCache.set(key, value, ttlSeconds)
    ]);
  }

  async del(key: string): Promise<void> {
    // Delete from both caches
    await Promise.all([
      this.redisCache.del(key),
      this.memoryCache.del(key)
    ]);
  }

  async exists(key: string): Promise<boolean> {
    // Check Redis first, then memory cache
    const redisExists = await this.redisCache.exists(key);
    if (redisExists) return true;
    
    return await this.memoryCache.exists(key);
  }

  // Cache with automatic key generation
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  // Invalidate cache by pattern (memory cache only for now)
  async invalidatePattern(pattern: string): Promise<void> {
    // For memory cache, we'll need to iterate through keys
    // Redis would support SCAN with pattern matching
    console.log(`🗑️ Cache invalidation pattern: ${pattern}`);
  }
}

// Create singleton instance
export const cache = new CacheManager();

// Cache key generators
export const CacheKeys = {
  // User-related caches
  user: (userId: string) => `user:${userId}`,
  userPlanLimits: (planType: string) => `plan_limits:${planType}`,
  userUsage: (userId: string, period: 'daily' | 'monthly') => `usage:${userId}:${period}`,
  
  // Contract-related caches
  contract: (contractId: number) => `contract:${contractId}`,
  userContracts: (userId: string) => `user_contracts:${userId}`,
  
  // Template and clause caches
  templates: (category?: string) => category ? `templates:${category}` : 'templates:all',
  clauses: (category?: string) => category ? `clauses:${category}` : 'clauses:all',
  
  // Analysis caches
  analysisResult: (contractId: number) => `analysis:${contractId}`,
  
  // Translation caches
  translation: (text: string, targetLang: string) => {
    const textHash = Buffer.from(text).toString('base64').substring(0, 32);
    return `translation:${textHash}:${targetLang}`;
  },
  
  // System caches
  systemHealth: () => 'system:health',
  apiStats: (endpoint: string) => `api_stats:${endpoint}`,
};

// Cache utilities
export class CacheUtils {
  /**
   * Cache user plan limits with 1 hour TTL
   */
  static async getPlanLimits(planType: string) {
    return cache.remember(
      CacheKeys.userPlanLimits(planType),
      () => storage.getPlanLimits(planType),
      3600 // 1 hour
    );
  }

  /**
   * Cache user data with 5 minute TTL
   */
  static async getUser(userId: string) {
    return cache.remember(
      CacheKeys.user(userId),
      () => storage.getUser(userId),
      300 // 5 minutes
    );
  }

  /**
   * Cache contract data with 10 minute TTL
   */
  static async getContract(contractId: number) {
    return cache.remember(
      CacheKeys.contract(contractId),
      () => storage.getContract(contractId),
      600 // 10 minutes
    );
  }

  /**
   * Cache templates with 30 minute TTL
   */
  static async getTemplates(category?: string) {
    return cache.remember(
      CacheKeys.templates(category),
      () => category ? storage.getTemplatesByCategory(category) : storage.getTemplates(),
      1800 // 30 minutes
    );
  }

  /**
   * Cache clauses with 30 minute TTL
   */
  static async getClauses(category?: string) {
    return cache.remember(
      CacheKeys.clauses(category),
      () => category ? storage.getClausesByCategory(category) : storage.getClauses(),
      1800 // 30 minutes
    );
  }

  /**
   * Invalidate user-related caches
   */
  static async invalidateUserCache(userId: string) {
    await Promise.all([
      cache.del(CacheKeys.user(userId)),
      cache.del(CacheKeys.userContracts(userId)),
      cache.del(CacheKeys.userUsage(userId, 'daily')),
      cache.del(CacheKeys.userUsage(userId, 'monthly')),
    ]);
  }

  /**
   * Invalidate contract-related caches
   */
  static async invalidateContractCache(contractId: number, userId?: string) {
    await Promise.all([
      cache.del(CacheKeys.contract(contractId)),
      cache.del(CacheKeys.analysisResult(contractId)),
      ...(userId ? [cache.del(CacheKeys.userContracts(userId))] : [])
    ]);
  }

  /**
   * Warm up frequently accessed caches
   */
  static async warmupCache() {
    console.log('🔥 Warming up cache...');
    
    try {
      // Cache plan limits for all plan types
      const planTypes = ['free', 'plus', 'pro', 'premium'];
      await Promise.all(
        planTypes.map(planType => this.getPlanLimits(planType))
      );

      // Cache templates and clauses
      await Promise.all([
        this.getTemplates(),
        this.getClauses()
      ]);

      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.warn('⚠️ Cache warmup failed:', error);
    }
  }
}

// Cache middleware for Express routes
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `route:${req.originalUrl}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }
    } catch (error) {
      console.warn('Cache middleware error:', error);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttlSeconds).catch(error => {
          console.warn('Failed to cache response:', error);
        });
      }
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

// Initialize cache warmup on startup
setTimeout(() => {
  CacheUtils.warmupCache();
}, 5000); // Wait 5 seconds after startup