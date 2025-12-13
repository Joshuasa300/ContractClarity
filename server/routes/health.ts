/**
 * Health check and monitoring endpoints for ContractClarity
 * Provides system status, metrics, and diagnostic information
 */

import { Router } from 'express';
import { HealthChecker, metricsCollector, getMetricsData } from '../lib/monitoring';
import { cache } from '../lib/cache';
import { asyncHandler } from '../lib/errors';

const router = Router();

/**
 * Basic health check endpoint
 * Returns simple status for load balancers
 */
router.get('/health', asyncHandler(async (req: any, res: any) => {
  const healthStatus = await HealthChecker.getHealthStatus();
  
  // Return appropriate HTTP status code
  const statusCode = healthStatus.status === 'healthy' ? 200 
    : healthStatus.status === 'degraded' ? 200 
    : 503;

  res.status(statusCode).json({
    status: healthStatus.status,
    timestamp: healthStatus.timestamp,
    uptime: healthStatus.uptime
  });
}));

/**
 * Detailed health check with service status
 */
router.get('/health/detailed', asyncHandler(async (req: any, res: any) => {
  const healthStatus = await HealthChecker.getHealthStatus();
  
  const statusCode = healthStatus.status === 'healthy' ? 200 
    : healthStatus.status === 'degraded' ? 200 
    : 503;

  res.status(statusCode).json(healthStatus);
}));

/**
 * Readiness probe for Kubernetes/container orchestration
 */
router.get('/ready', asyncHandler(async (req: any, res: any) => {
  const dbCheck = await HealthChecker.checkDatabase();
  
  if (dbCheck.status === 'healthy') {
    res.status(200).json({
      status: 'ready',
      timestamp: Date.now(),
      database: dbCheck
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: Date.now(),
      database: dbCheck
    });
  }
}));

/**
 * Liveness probe for Kubernetes/container orchestration
 */
router.get('/live', asyncHandler(async (req: any, res: any) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now(),
    uptime: process.uptime() * 1000 // Convert to milliseconds
  });
}));

/**
 * System metrics endpoint (protected)
 */
router.get('/metrics', asyncHandler(async (req: any, res: any) => {
  // In production, you might want to protect this endpoint
  // with authentication or IP whitelisting
  
  const metrics = getMetricsData();
  
  res.json({
    timestamp: Date.now(),
    ...metrics
  });
}));

/**
 * Performance metrics in Prometheus format (optional)
 */
router.get('/metrics/prometheus', asyncHandler(async (req: any, res: any) => {
  const systemMetrics = metricsCollector.getSystemMetrics();
  
  // Basic Prometheus format metrics
  const prometheusMetrics = [
    `# HELP http_requests_total Total number of HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total ${systemMetrics.requestCount}`,
    ``,
    `# HELP http_request_duration_ms Average HTTP request duration in milliseconds`,
    `# TYPE http_request_duration_ms gauge`,
    `http_request_duration_ms ${systemMetrics.averageResponseTime}`,
    ``,
    `# HELP http_errors_total Total number of HTTP errors`,
    `# TYPE http_errors_total counter`,
    `http_errors_total ${systemMetrics.errorCount}`,
    ``,
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${Math.floor(systemMetrics.uptime / 1000)}`,
    ``
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(prometheusMetrics);
}));

/**
 * Cache status endpoint
 */
router.get('/cache/status', asyncHandler(async (req: any, res: any) => {
  const cacheStatus = await HealthChecker.checkCache();
  
  res.json({
    cache: cacheStatus,
    timestamp: Date.now()
  });
}));

/**
 * Database status endpoint
 */
router.get('/database/status', asyncHandler(async (req: any, res: any) => {
  const dbStatus = await HealthChecker.checkDatabase();
  
  const statusCode = dbStatus.status === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json({
    database: dbStatus,
    timestamp: Date.now()
  });
}));

/**
 * System information endpoint
 */
router.get('/system/info', asyncHandler(async (req: any, res: any) => {
  const systemInfo = {
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime() * 1000,
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development',
    timestamp: Date.now()
  };

  res.json(systemInfo);
}));

/**
 * Recent errors endpoint (for debugging)
 */
router.get('/errors/recent', asyncHandler(async (req: any, res: any) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const errors = metricsCollector.getRecentErrors(Math.min(limit, 50));
  
  res.json({
    errors,
    count: errors.length,
    timestamp: Date.now()
  });
}));

/**
 * Endpoint performance statistics
 */
router.get('/performance/endpoints', asyncHandler(async (req: any, res: any) => {
  const endpoints = [
    '/api/contracts',
    '/api/auth/login',
    '/api/user',
    '/api/templates',
    '/api/clauses'
  ];

  const endpointStats = endpoints.reduce((stats, endpoint) => {
    stats[endpoint] = metricsCollector.getEndpointMetrics(endpoint);
    return stats;
  }, {} as Record<string, any>);

  res.json({
    endpoints: endpointStats,
    timestamp: Date.now()
  });
}));

/**
 * Force garbage collection (development only)
 */
router.post('/system/gc', asyncHandler(async (req: any, res: any) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Garbage collection endpoint not available in production'
    });
  }

  try {
    if (global.gc) {
      const beforeMemory = process.memoryUsage();
      global.gc();
      const afterMemory = process.memoryUsage();
      
      res.json({
        message: 'Garbage collection triggered',
        memory: {
          before: beforeMemory,
          after: afterMemory,
          freed: {
            rss: beforeMemory.rss - afterMemory.rss,
            heapTotal: beforeMemory.heapTotal - afterMemory.heapTotal,
            heapUsed: beforeMemory.heapUsed - afterMemory.heapUsed
          }
        },
        timestamp: Date.now()
      });
    } else {
      res.status(400).json({
        error: 'Garbage collection not available. Start with --expose-gc flag.'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to trigger garbage collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * Clear cache endpoint (development/admin only)
 */
router.post('/cache/clear', asyncHandler(async (req: any, res: any) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Cache clear endpoint not available in production'
    });
  }

  try {
    // Clear specific cache keys if provided
    const { keys } = req.body;
    
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        await cache.del(key);
      }
      res.json({
        message: `Cleared ${keys.length} cache keys`,
        keys,
        timestamp: Date.now()
      });
    } else {
      // Note: Full cache clear would need to be implemented based on cache backend
      res.json({
        message: 'Cache clear requested (partial implementation)',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;