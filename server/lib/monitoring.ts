/**
 * Performance monitoring and metrics collection for ContractClarity
 * Provides request timing, error tracking, and system health monitoring
 */

import { cache, CacheKeys } from './cache';

// Performance metrics storage
interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

interface SystemMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequestCount: number;
  uptime: number;
  memoryUsage: any;
  timestamp: number;
}

interface ErrorMetrics {
  path: string;
  method: string;
  error: string;
  statusCode: number;
  timestamp: number;
  userId?: string;
  stack?: string;
}

class MetricsCollector {
  private requestMetrics: RequestMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private startTime: number = Date.now();
  private readonly maxMetricsHistory = 1000; // Keep last 1000 requests
  private readonly slowRequestThreshold = 1000; // 1 second

  /**
   * Record a request metric
   */
  recordRequest(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.requestMetrics.length > this.maxMetricsHistory) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetricsHistory);
    }

    // Log slow requests
    if (metrics.duration > this.slowRequestThreshold) {
      console.warn(`🐌 Slow request detected: ${metrics.method} ${metrics.path} took ${metrics.duration}ms`);
    }

    // Log errors
    if (metrics.statusCode >= 400) {
      console.error(`❌ Error request: ${metrics.method} ${metrics.path} returned ${metrics.statusCode}`);
    }
  }

  /**
   * Record an error metric
   */
  recordError(error: ErrorMetrics): void {
    this.errorMetrics.push(error);
    
    // Keep only recent errors
    if (this.errorMetrics.length > this.maxMetricsHistory) {
      this.errorMetrics = this.errorMetrics.slice(-this.maxMetricsHistory);
    }

    console.error(`💥 Application error: ${error.method} ${error.path} - ${error.error}`);
  }

  /**
   * Get current system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const now = Date.now();
    const recentRequests = this.requestMetrics.filter(
      req => now - req.timestamp < 60000 // Last minute
    );

    const totalDuration = recentRequests.reduce((sum, req) => sum + req.duration, 0);
    const averageResponseTime = recentRequests.length > 0 
      ? Math.round(totalDuration / recentRequests.length) 
      : 0;

    const errorCount = recentRequests.filter(req => req.statusCode >= 400).length;
    const slowRequestCount = recentRequests.filter(req => req.duration > this.slowRequestThreshold).length;

    return {
      requestCount: recentRequests.length,
      errorCount,
      averageResponseTime,
      slowRequestCount,
      uptime: now - this.startTime,
      memoryUsage: this.getMemoryUsage(),
      timestamp: now
    };
  }

  /**
   * Get memory usage information
   */
  private getMemoryUsage(): any {
    try {
      // Try to get process memory usage if available
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        return {
          rss: Math.round(usage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
          external: Math.round(usage.external / 1024 / 1024), // MB
        };
      }
    } catch (error) {
      console.warn('Could not get memory usage:', error);
    }
    
    return { available: false };
  }

  /**
   * Get request metrics for a specific endpoint
   */
  getEndpointMetrics(path: string): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequestRate: number;
  } {
    const endpointRequests = this.requestMetrics.filter(req => req.path === path);
    
    if (endpointRequests.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequestRate: 0
      };
    }

    const totalDuration = endpointRequests.reduce((sum, req) => sum + req.duration, 0);
    const errorCount = endpointRequests.filter(req => req.statusCode >= 400).length;
    const slowCount = endpointRequests.filter(req => req.duration > this.slowRequestThreshold).length;

    return {
      totalRequests: endpointRequests.length,
      averageResponseTime: Math.round(totalDuration / endpointRequests.length),
      errorRate: Math.round((errorCount / endpointRequests.length) * 100),
      slowRequestRate: Math.round((slowCount / endpointRequests.length) * 100)
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorMetrics[] {
    return this.errorMetrics
      .slice(-limit)
      .reverse(); // Most recent first
  }

  /**
   * Clear old metrics (cleanup)
   */
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.requestMetrics = this.requestMetrics.filter(req => req.timestamp > cutoff);
    this.errorMetrics = this.errorMetrics.filter(err => err.timestamp > cutoff);
    
    console.log('🧹 Metrics cleanup completed');
  }
}

// Create singleton instance
export const metricsCollector = new MetricsCollector();

// Cleanup old metrics every hour
setInterval(() => {
  metricsCollector.cleanup();
}, 60 * 60 * 1000);

/**
 * Express middleware for request timing and metrics collection
 */
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const startHrTime = process.hrtime();

  // Capture request info
  const requestInfo = {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;
    const hrDuration = process.hrtime(startHrTime);
    const preciseMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;

    // Record metrics
    metricsCollector.recordRequest({
      ...requestInfo,
      statusCode: res.statusCode,
      duration: Math.round(preciseMs),
      timestamp: Date.now()
    });

    // Add performance headers
    res.set('X-Response-Time', `${Math.round(preciseMs)}ms`);
    res.set('X-Request-ID', req.id || 'unknown');

    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Error tracking middleware
 */
export const errorTrackingMiddleware = (error: any, req: any, res: any, next: any) => {
  // Record error metrics
  metricsCollector.recordError({
    path: req.path,
    method: req.method,
    error: error.message || 'Unknown error',
    statusCode: error.statusCode || 500,
    timestamp: Date.now(),
    userId: req.user?.id,
    stack: error.stack
  });

  next(error);
};

/**
 * Health check utilities
 */
export class HealthChecker {
  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      
      // Try to import storage and perform a simple query
      const { storage } = await import('../storage');
      await storage.getPlanLimits('free'); // Simple query to test DB
      
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }

  /**
   * Check OpenAI API connectivity
   */
  static async checkOpenAI(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
    try {
      // Simple check - just verify API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return { status: 'unhealthy', error: 'OpenAI API key not configured' };
      }
      
      return { status: 'healthy' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown OpenAI error' 
      };
    }
  }

  /**
   * Check cache connectivity
   */
  static async checkCache(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
    try {
      await cache.set('health_check', 'ok', 10);
      const value = await cache.get('health_check');
      await cache.del('health_check');
      
      if (value === 'ok') {
        return { status: 'healthy' };
      } else {
        return { status: 'unhealthy', error: 'Cache read/write test failed' };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown cache error' 
      };
    }
  }

  /**
   * Comprehensive health check
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: number;
    uptime: number;
    services: {
      database: any;
      openai: any;
      cache: any;
    };
    metrics: SystemMetrics;
  }> {
    const [database, openai, cacheStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkOpenAI(),
      this.checkCache()
    ]);

    const services = { database, openai, cache: cacheStatus };
    const metrics = metricsCollector.getSystemMetrics();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (database.status === 'unhealthy') {
      status = 'unhealthy'; // Database is critical
    } else if (openai.status === 'unhealthy' || cacheStatus.status === 'unhealthy') {
      status = 'degraded'; // Other services are important but not critical
    }

    return {
      status,
      timestamp: Date.now(),
      uptime: metrics.uptime,
      services,
      metrics
    };
  }
}

/**
 * Request ID middleware for tracing
 */
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  // Generate unique request ID
  req.id = `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  res.set('X-Request-ID', req.id);
  next();
};

/**
 * Rate limiting metrics
 */
export const rateLimitMetrics = {
  record: (identifier: string, limit: number, remaining: number) => {
    // Could be extended to track rate limiting patterns
    if (remaining <= 0) {
      console.warn(`🚫 Rate limit exceeded for ${identifier}`);
    }
  }
};

/**
 * API endpoint for metrics (for monitoring dashboards)
 */
export const getMetricsData = () => {
  const systemMetrics = metricsCollector.getSystemMetrics();
  const recentErrors = metricsCollector.getRecentErrors(5);
  
  return {
    system: systemMetrics,
    errors: recentErrors,
    endpoints: {
      '/api/contracts': metricsCollector.getEndpointMetrics('/api/contracts'),
      '/api/auth/login': metricsCollector.getEndpointMetrics('/api/auth/login'),
      '/api/user': metricsCollector.getEndpointMetrics('/api/user')
    }
  };
};