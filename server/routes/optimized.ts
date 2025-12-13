/**
 * Optimized routes for ContractClarity
 * Demonstrates integration of all performance improvements
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { contractService } from "../services/contractService";
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  contractUploadSchema,
  registerSchema,
  loginSchema,
  emailVerificationSchema,
  supportContactSchema
} from "../lib/validation";
import {
  errorHandler,
  asyncHandler,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  UsageLimitError
} from "../lib/errors";
import {
  performanceMiddleware,
  errorTrackingMiddleware,
  requestIdMiddleware
} from "../lib/monitoring";
import { cacheMiddleware, CacheUtils } from "../lib/cache";
import healthRouter from "./health";
import multer from "multer";
import { 
  apiLimiter, 
  fileUploadLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter,
  registrationLimiter,
  checkoutLimiter 
} from "../rateLimit";

// Configure multer for file uploads with validation
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    throw new AuthenticationError();
  }
  next();
}

export async function registerOptimizedRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Apply global middleware
  app.use(requestIdMiddleware);
  app.use(performanceMiddleware);
  app.use('/api', apiLimiter);

  // Health check routes (no authentication required)
  app.use('/health', healthRouter);

  // Contract routes with optimizations
  app.post('/api/contracts', 
    isAuthenticated,
    fileUploadLimiter,
    upload.single('contract'),
    asyncHandler(async (req: any, res: any) => {
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      const contract = await contractService.uploadContract(req.file, req.user.id);
      
      // Invalidate user contracts cache
      await CacheUtils.invalidateUserCache(req.user.id);
      
      res.json({ 
        contractId: contract.id, 
        message: "Contract uploaded successfully. Analysis in progress." 
      });
    })
  );

  app.get('/api/contracts',
    isAuthenticated,
    cacheMiddleware(300), // Cache for 5 minutes
    asyncHandler(async (req: any, res: any) => {
      const contracts = await contractService.getUserContracts(req.user.id);
      res.json(contracts);
    })
  );

  app.get('/api/contracts/:id',
    isAuthenticated,
    validateParams(contractUploadSchema.pick({ contractId: true })),
    cacheMiddleware(600), // Cache for 10 minutes
    asyncHandler(async (req: any, res: any) => {
      const contractId = parseInt(req.params.id);
      const contract = await contractService.getContract(contractId, req.user.id);
      res.json(contract);
    })
  );

  app.post('/api/contracts/:id/analyze',
    isAuthenticated,
    validateParams(contractUploadSchema.pick({ contractId: true })),
    asyncHandler(async (req: any, res: any) => {
      const contractId = parseInt(req.params.id);
      const contract = await contractService.analyzeContract(contractId, req.user.id);
      
      // Invalidate contract cache
      await CacheUtils.invalidateContractCache(contractId, req.user.id);
      
      res.json(contract);
    })
  );

  app.delete('/api/contracts/:id',
    isAuthenticated,
    validateParams(contractUploadSchema.pick({ contractId: true })),
    asyncHandler(async (req: any, res: any) => {
      const contractId = parseInt(req.params.id);
      await contractService.deleteContract(contractId, req.user.id);
      
      // Invalidate caches
      await CacheUtils.invalidateContractCache(contractId, req.user.id);
      
      res.json({ message: "Contract deleted successfully" });
    })
  );

  // Contract size validation endpoint
  app.post('/api/contracts/validate-size',
    isAuthenticated,
    upload.single('contract'),
    asyncHandler(async (req: any, res: any) => {
      if (!req.file) {
        throw new ValidationError('No file uploaded for validation');
      }

      const validation = await contractService.validateContractSize(req.file, req.user.id);
      res.json(validation);
    })
  );

  // Usage check endpoint with caching
  app.get('/api/usage/check/:operation',
    isAuthenticated,
    cacheMiddleware(60), // Cache for 1 minute
    asyncHandler(async (req: any, res: any) => {
      const { storage } = await import('../storage');
      const usageCheck = await storage.checkUsageLimit(req.user.id, req.params.operation);
      res.json(usageCheck);
    })
  );

  // Template routes with caching
  app.get('/api/templates',
    isAuthenticated,
    cacheMiddleware(1800), // Cache for 30 minutes
    asyncHandler(async (req: any, res: any) => {
      const { category } = req.query;
      const templates = await CacheUtils.getTemplates(category as string);
      res.json(templates);
    })
  );

  app.get('/api/templates/:id',
    isAuthenticated,
    cacheMiddleware(1800), // Cache for 30 minutes
    asyncHandler(async (req: any, res: any) => {
      const templateId = parseInt(req.params.id);
      const { storage } = await import('../storage');
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    })
  );

  // Clause library routes with caching
  app.get('/api/clauses',
    isAuthenticated,
    cacheMiddleware(1800), // Cache for 30 minutes
    asyncHandler(async (req: any, res: any) => {
      const { category, search } = req.query;
      const clauses = await CacheUtils.getClauses(category as string);
      res.json(clauses);
    })
  );

  // Authentication routes with validation
  app.post('/api/auth/register',
    registrationLimiter,
    validateBody(registerSchema),
    asyncHandler(async (req: any, res: any) => {
      const { storage } = await import('../storage');
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      // Create pending registration logic here...
      res.status(201).json({
        message: 'Registration initiated. Please check your email for verification.',
        requiresVerification: true
      });
    })
  );

  app.post('/api/auth/login',
    validateBody(loginSchema),
    asyncHandler(async (req: any, res: any) => {
      const { storage } = await import('../storage');
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || user.authProvider !== 'local') {
        throw new AuthenticationError('Invalid email or password');
      }

      // Password verification logic here...
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountStatus: user.accountStatus,
        }
      });
    })
  );

  app.post('/api/auth/verify-email',
    emailVerificationLimiter,
    validateBody(emailVerificationSchema),
    asyncHandler(async (req: any, res: any) => {
      const { storage } = await import('../storage');
      const { email, code } = req.body;

      const result = await storage.completePendingRegistration(email, code);
      
      if (result.success && result.user) {
        res.json({
          message: 'Email verified and account created successfully',
          success: true,
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            accountStatus: result.user.accountStatus,
          }
        });
      } else {
        throw new ValidationError('Invalid or expired verification code');
      }
    })
  );

  // Support contact with validation
  app.post('/api/support/contact',
    validateBody(supportContactSchema),
    asyncHandler(async (req: any, res: any) => {
      const { name, email, subject, message } = req.body;

      const { emailService } = await import('../services/emailService');
      
      const emailSent = await emailService.sendSupportEmail({
        from: email,
        fromName: name,
        subject: subject,
        message: message,
        to: "info@contractclarity.co.uk"
      });

      if (!emailSent) {
        throw new Error('Failed to send support email');
      }

      res.json({ 
        message: "Support email sent successfully" 
      });
    })
  );

  // Error handling middleware (must be last)
  app.use(errorTrackingMiddleware);
  app.use(errorHandler);

  return server;
}

// Example of how to integrate with existing routes
export function enhanceExistingRoutes(app: Express) {
  // Add performance monitoring to existing routes
  app.use(performanceMiddleware);
  app.use(requestIdMiddleware);
  
  // Add caching to frequently accessed endpoints
  app.get('/api/user', cacheMiddleware(300)); // Cache user data for 5 minutes
  app.get('/api/templates', cacheMiddleware(1800)); // Cache templates for 30 minutes
  app.get('/api/clauses', cacheMiddleware(1800)); // Cache clauses for 30 minutes
  
  // Add error tracking
  app.use(errorTrackingMiddleware);
  app.use(errorHandler);
}