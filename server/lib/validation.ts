/**
 * Comprehensive input validation schemas for ContractClarity
 * Uses Zod for runtime type checking and validation
 */

import { z } from 'zod';
import { ValidationError } from './errors';

// Common validation patterns
const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email too long')
  .transform((email: string) => email.toLowerCase().trim());

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number');

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
  .transform((name: string) => name.trim());

const languageSchema = z.enum(['en', 'es', 'fr', 'de', 'ar'], {
  errorMap: () => ({ message: 'Invalid language code' })
});

const planTypeSchema = z.enum(['free', 'plus', 'pro', 'premium'], {
  errorMap: () => ({ message: 'Invalid plan type' })
});

// File validation
const fileSchema = z.object({
  originalname: z.string().min(1, 'Filename is required'),
  mimetype: z.enum([
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ], { errorMap: () => ({ message: 'Invalid file type. Only PDF, TXT, and DOCX files are allowed.' }) }),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  buffer: z.any() // Using z.any() to avoid Buffer type issues
});

// Authentication schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const emailVerificationSchema = z.object({
  email: emailSchema,
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers')
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema
});

// Contract schemas
export const contractUploadSchema = z.object({
  file: fileSchema
});

export const contractAnalysisSchema = z.object({
  contractId: z.number().int().positive('Invalid contract ID')
});

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional()
}).refine((data: any) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

// Template schemas
export const templateVariablesSchema = z.record(
  z.string().min(1, 'Variable name cannot be empty'),
  z.string().max(1000, 'Variable value too long')
);

export const createContractFromTemplateSchema = z.object({
  templateId: z.number().int().positive('Invalid template ID'),
  variables: templateVariablesSchema,
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[^<>:"/\\|?*]+$/, 'Filename contains invalid characters')
});

// Translation schemas
export const translateTextSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  targetLanguage: languageSchema,
  context: z.string().max(500, 'Context too long').optional()
});

export const translateBatchSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  context: z.string().max(500, 'Context too long').optional()
});

// Subscription schemas
export const createCheckoutSessionSchema = z.object({
  planId: z.enum(['plus', 'pro', 'premium'], {
    errorMap: () => ({ message: 'Invalid plan ID' })
  })
});

// Support schemas
export const supportContactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long')
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform((val: string) => parseInt(val))
    .refine((val: number) => val > 0, 'Page must be greater than 0')
    .optional()
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform((val: string) => parseInt(val))
    .refine((val: number) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
    .default('10')
});

export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long')
    .transform((query: string) => query.trim()),
  category: z.string().max(50, 'Category too long').optional()
});

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
        );
        return res.status(validationError.statusCode).json(validationError.toJSON());
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
        );
        return res.status(validationError.statusCode).json(validationError.toJSON());
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
        );
        return res.status(validationError.statusCode).json(validationError.toJSON());
      }
      next(error);
    }
  };
};

// File validation helper
export const validateFile = (file: any) => {
  try {
    return fileSchema.parse(file);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.errors.map((err: any) => err.message).join(', ')
      );
    }
    throw error;
  }
};

// Sanitization helpers
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  windowMs: z.number().int().positive(),
  max: z.number().int().positive(),
  message: z.string().optional()
});

// Environment validation (simplified for compatibility)
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  DATABASE_URL: z.string().url('Invalid database URL'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret'),
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  EMAIL_SERVICE_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().url('Invalid frontend URL').optional()
});

// Export types for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ContractUploadInput = z.infer<typeof contractUploadSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TranslateTextInput = z.infer<typeof translateTextSchema>;
export type SupportContactInput = z.infer<typeof supportContactSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ValidatedEnv = z.infer<typeof envSchema>;