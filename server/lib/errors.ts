/**
 * Centralized error handling for ContractClarity
 * Provides consistent error types and handling across the application
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Usage & Limits
  USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Business Logic
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  
  // External Services
  OPENAI_ERROR = 'OPENAI_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  
  // System
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        ...(this.context && { context: this.context })
      }
    };
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, ErrorCode.UNAUTHORIZED, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(message, 403, ErrorCode.FORBIDDEN, true, context);
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(email: string) {
    super(
      'Email address not verified. Please check your email for verification instructions.',
      403,
      ErrorCode.EMAIL_NOT_VERIFIED,
      true,
      { email }
    );
  }
}

/**
 * Usage and limit errors
 */
export class UsageLimitError extends AppError {
  constructor(
    operation: string,
    limit: number,
    current: number,
    planType: string = 'current'
  ) {
    super(
      `Usage limit exceeded for ${operation}. Current: ${current}, Limit: ${limit}`,
      429,
      ErrorCode.USAGE_LIMIT_EXCEEDED,
      true,
      { operation, limit, current, planType }
    );
  }
}

export class FileTooLargeError extends AppError {
  constructor(fileSize: number, maxSize: number, fileName?: string) {
    super(
      `File too large. Size: ${Math.round(fileSize / 1024 / 1024)}MB, Max: ${Math.round(maxSize / 1024 / 1024)}MB`,
      413,
      ErrorCode.FILE_TOO_LARGE,
      true,
      { fileSize, maxSize, fileName }
    );
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(fileType: string, allowedTypes: string[]) {
    super(
      `Invalid file type: ${fileType}. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      ErrorCode.INVALID_FILE_TYPE,
      true,
      { fileType, allowedTypes }
    );
  }
}

export class PaymentRequiredError extends AppError {
  constructor(feature: string, planType: string = 'paid') {
    super(
      `Payment required to access ${feature}. Please upgrade to a ${planType} plan.`,
      402,
      ErrorCode.PAYMENT_REQUIRED,
      true,
      { feature, planType }
    );
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: any) {
    super(
      message,
      400,
      ErrorCode.VALIDATION_ERROR,
      true,
      { field, value }
    );
  }
}

/**
 * Business logic errors
 */
export class ContractNotFoundError extends AppError {
  constructor(contractId: number | string) {
    super(
      `Contract not found: ${contractId}`,
      404,
      ErrorCode.CONTRACT_NOT_FOUND,
      true,
      { contractId }
    );
  }
}

export class AnalysisFailedError extends AppError {
  constructor(reason: string, contractId?: number) {
    super(
      `Contract analysis failed: ${reason}`,
      500,
      ErrorCode.ANALYSIS_FAILED,
      true,
      { reason, contractId }
    );
  }
}

/**
 * External service errors
 */
export class OpenAIError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      `OpenAI service error: ${message}`,
      503,
      ErrorCode.OPENAI_ERROR,
      true,
      { originalError: originalError?.message }
    );
  }
}

export class StripeError extends AppError {
  constructor(message: string, stripeCode?: string) {
    super(
      `Stripe error: ${message}`,
      503,
      ErrorCode.STRIPE_ERROR,
      true,
      { stripeCode }
    );
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, operation?: string, originalError?: Error) {
    super(
      `Database error: ${message}`,
      500,
      ErrorCode.DATABASE_ERROR,
      false, // Database errors are not operational
      { operation, originalError: originalError?.message }
    );
  }
}

/**
 * Error factory functions for common scenarios
 */
export const createUsageLimitError = (
  operation: string,
  usageCheck: { limit: number; current: number },
  planType?: string
) => new UsageLimitError(operation, usageCheck.limit, usageCheck.current, planType);

export const createFileValidationError = (file: { size: number; mimetype: string; originalname?: string }) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (file.size > maxSize) {
    return new FileTooLargeError(file.size, maxSize, file.originalname);
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return new InvalidFileTypeError(file.mimetype, allowedTypes);
  }
  
  return null;
};

/**
 * Error handler middleware for Express
 */
export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  // Log error details
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    const validationError = new ValidationError(error.message);
    return res.status(validationError.statusCode).json(validationError.toJSON());
  }

  if (error.name === 'CastError' || error.name === 'MongoError') {
    const dbError = new DatabaseError(error.message);
    return res.status(dbError.statusCode).json(dbError.toJSON());
  }

  // Handle unknown errors
  const unknownError = new AppError(
    'An unexpected error occurred',
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    false
  );
  
  res.status(unknownError.statusCode).json(unknownError.toJSON());
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error logging utility
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  const logData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  };

  if (error instanceof AppError) {
    logData.code = error.code;
    logData.statusCode = error.statusCode;
    logData.isOperational = error.isOperational;
    logData.context = error.context;
  }

  console.error('Application Error:', logData);
  
  // In production, you might want to send this to an external logging service
  // like Sentry, LogRocket, or CloudWatch
};