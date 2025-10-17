import rateLimit from 'express-rate-limit';

// Rate limiter for login attempts - strict to prevent brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting against the limit
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60
    });
  }
});

// Rate limiter for registration - prevent spam account creation
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    message: 'Too many registration attempts. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for registration from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many registration attempts. Please try again in 1 hour.',
      retryAfter: 60 * 60
    });
  }
});

// Rate limiter for password reset requests
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    message: 'Too many password reset requests. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for password reset from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many password reset requests. Please try again in 1 hour.',
      retryAfter: 60 * 60
    });
  }
});

// Rate limiter for email verification
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 verification attempts per hour
  message: {
    message: 'Too many verification attempts. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for email verification from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many verification attempts. Please try again in 1 hour.',
      retryAfter: 60 * 60
    });
  }
});

// Rate limiter for file uploads - prevent abuse
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    message: 'Too many file uploads. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for file upload from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many file uploads. Please try again later.',
      retryAfter: 60 * 60
    });
  }
});

// General API rate limiter - applies to all API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    message: 'Too many requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for webhooks and static assets
  skip: (req) => {
    return req.path.startsWith('/api/webhook') || 
           !req.path.startsWith('/api');
  },
  handler: (req, res) => {
    console.log(`⚠️ API rate limit exceeded from IP: ${req.ip} for path: ${req.path}`);
    res.status(429).json({
      message: 'Too many requests. Please slow down.',
      retryAfter: 15 * 60
    });
  }
});

// Strict rate limiter for Stripe checkout to prevent payment spam
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 checkout attempts per 15 minutes
  message: {
    message: 'Too many checkout attempts. Please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for checkout from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many checkout attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60
    });
  }
});
