import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertContractSchema } from "@shared/schema";
import { processContractAnalysis } from "./services/contractAnalysis";
import { translateText, translateToAllLanguages, translateObjectToAllLanguages } from "./services/translationService";
import { translationSyncService } from "./services/translationSync";
import multer from "multer";
import { z } from "zod";
import Stripe from "stripe";
// PDF2JSON for reliable PDF text extraction
import PDFParser from "pdf2json";
// Mammoth for DOCX text extraction
import mammoth from "mammoth";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Also check file extension as backup
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Contract routes
  app.post('/api/contracts', isAuthenticated, upload.single('contract'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text content based on file type
      let fileContent = "";
      if (file.mimetype === 'text/plain') {
        fileContent = file.buffer.toString('utf-8');
      } else if (file.mimetype === 'application/pdf') {
        try {
          // Parse PDF using pdf2json
          const pdfParser = new PDFParser();
          
          // Create a promise to handle the async PDF parsing
          const extractedText = await new Promise<string>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => {
              reject(new Error(`PDF parsing error: ${errData.parserError}`));
            });
            
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
              try {
                let text = '';
                
                // Extract text from all pages
                if (pdfData.Pages) {
                  for (const page of pdfData.Pages) {
                    if (page.Texts) {
                      for (const textItem of page.Texts) {
                        if (textItem.R) {
                          for (const run of textItem.R) {
                            if (run.T) {
                              // Decode URI component and add space
                              text += decodeURIComponent(run.T) + ' ';
                            }
                          }
                        }
                      }
                    }
                    text += '\n'; // Add newline between pages
                  }
                }
                
                resolve(text.trim());
              } catch (parseError) {
                reject(new Error(`Text extraction error: ${parseError}`));
              }
            });
            
            // Parse the PDF buffer
            pdfParser.parseBuffer(file.buffer);
          });
          
          fileContent = extractedText;
          
        } catch (error) {
          console.error("PDF parsing error:", error);
          return res.status(400).json({ 
            message: "Failed to parse PDF file. Please ensure it's a valid PDF with readable text, or try converting it to a text file (.txt)." 
          });
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.originalname.toLowerCase().endsWith('.docx')) {
        // Handle DOCX files
        try {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          fileContent = result.value;
          
          if (result.messages && result.messages.length > 0) {
            console.warn("DOCX parsing warnings:", result.messages);
          }
        } catch (error) {
          console.error("DOCX parsing error:", error);
          return res.status(400).json({ 
            message: "Failed to parse DOCX file. Please ensure it's a valid Word document with readable text." 
          });
        }
      } else {
        return res.status(400).json({ 
          message: "Unsupported file type. Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt)." 
        });
      }

      if (!fileContent.trim()) {
        return res.status(400).json({ message: "File appears to be empty" });
      }

      const contractData = {
        userId,
        fileName: file.originalname,
        fileContent,
        analysisComplete: false,
      };

      const contract = await storage.createContract(contractData);
      
      // Start analysis asynchronously
      processContractAnalysis(contract.id).catch(error => {
        console.error("Background analysis failed:", error);
        
        // If it's a usage limit error, don't fail silently
        if (error.message.startsWith('USAGE_LIMIT_EXCEEDED:')) {
          console.log("Usage limit exceeded for contract:", contract.id);
        }
      });

      res.json({ 
        contractId: contract.id, 
        message: "Contract uploaded successfully. Analysis in progress." 
      });
    } catch (error) {
      console.error("Error uploading contract:", error);
      res.status(500).json({ message: "Failed to upload contract" });
    }
  });

  app.get('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contracts = await storage.getUserContracts(userId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contractId = parseInt(req.params.id);
      
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Check if user owns the contract
      if (contract.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts/:id/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contractId = parseInt(req.params.id);
      
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Check if user owns the contract
      if (contract.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Trigger analysis
      await processContractAnalysis(contractId);
      
      // Return updated contract
      const updatedContract = await storage.getContract(contractId);
      res.json(updatedContract);
    } catch (error) {
      console.error("Error analyzing contract:", error);
      res.status(500).json({ message: "Failed to analyze contract" });
    }
  });

  // Check usage limits
  app.get('/api/usage/check/:operation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operation = req.params.operation;
      
      const usageCheck = await storage.checkUsageLimit(userId, operation);
      res.json(usageCheck);
    } catch (error) {
      console.error("Error checking usage limits:", error);
      res.status(500).json({ message: "Failed to check usage limits" });
    }
  });

  // Demo endpoint to show page calculation
  app.get("/api/demo/page-limits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Define size limits per plan
      const tokenLimits = {
        free: 8000,       // ~20 pages
        plus: 46800,      // ~117 pages  
        pro: 140000,      // ~350 pages
        premium: 190800   // ~477 pages
      };

      const examples = [
        { name: "Small Contract (5 pages)", chars: 10000 },
        { name: "Medium Contract (50 pages)", chars: 100000 },
        { name: "Large Contract (200 pages)", chars: 400000 },
        { name: "Enterprise Contract (1000 pages)", chars: 2000000 }
      ];

      const results = examples.map(example => {
        const textTokens = Math.ceil(example.chars / 4);
        const systemPromptTokens = 800;
        const responseTokens = 2000;
        const totalTokens = textTokens + systemPromptTokens + responseTokens;
        const estimatedPages = Math.ceil(totalTokens / 400);

        const planResults = Object.entries(tokenLimits).map(([plan, limit]) => ({
          plan,
          allowed: totalTokens <= limit,
          maxPages: Math.floor(limit / 400)
        }));

        return {
          ...example,
          textTokens,
          totalTokens,
          estimatedPages,
          planResults
        };
      });

      const currentPlan = user.accountStatus;
      const currentLimit = tokenLimits[currentPlan as keyof typeof tokenLimits] || tokenLimits.free;
      const currentMaxPages = Math.floor(currentLimit / 400);

      res.json({
        currentPlan,
        currentLimit,
        currentMaxPages,
        examples: results,
        explanation: {
          tokenCalculation: "Total Tokens = (Characters ÷ 4) + System Prompt (800) + Response (2000)",
          pageCalculation: "Estimated Pages = Total Tokens ÷ 400",
          planLimits: Object.entries(tokenLimits).map(([plan, limit]) => ({
            plan,
            tokenLimit: limit,
            pageLimit: Math.floor(limit / 400)
          }))
        }
      });
    } catch (error) {
      console.error("Error showing page limits demo:", error);
      res.status(500).json({ message: "Failed to show page limits demo" });
    }
  });

  // Check contract size limits by uploading the file
  app.post("/api/contracts/validate-size", isAuthenticated, upload.single('contract'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        console.log("Error validating document size: No file uploaded for validation");
        return res.status(400).json({ message: "No file uploaded for validation" });
      }

      console.log(`Validating document size: ${file.originalname}, type: ${file.mimetype}, size: ${file.size} bytes for user ${userId}`);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Extract text content and count pages based on file type
      let actualPages = 1;
      let fileContent = "";
      
      if (file.mimetype === 'text/plain') {
        fileContent = file.buffer.toString('utf-8');
        const lines = fileContent.split('\n').length;
        const linesPerPage = 50; // typical lines per page
        actualPages = Math.max(1, Math.ceil(lines / linesPerPage));
      } else if (file.mimetype === 'application/pdf') {
        try {
          // Parse PDF using pdf2json and count actual pages
          const pdfParser = new PDFParser();
          
          const pdfInfo = await new Promise<{text: string, pageCount: number}>((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData: any) => {
              reject(new Error(`PDF parsing error: ${errData.parserError}`));
            });
            
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
              try {
                let text = '';
                let pageCount = 0;
                
                // Extract text from all pages and count them
                if (pdfData.Pages) {
                  pageCount = pdfData.Pages.length;
                  for (const page of pdfData.Pages) {
                    if (page.Texts) {
                      for (const textItem of page.Texts) {
                        if (textItem.R) {
                          for (const run of textItem.R) {
                            if (run.T) {
                              text += decodeURIComponent(run.T) + ' ';
                            }
                          }
                        }
                      }
                    }
                    text += '\n';
                  }
                }
                
                resolve({ text: text.trim(), pageCount });
              } catch (parseError) {
                reject(new Error(`Text extraction error: ${parseError}`));
              }
            });
            
            pdfParser.parseBuffer(file.buffer);
          });
          
          actualPages = pdfInfo.pageCount;
          fileContent = pdfInfo.text;
          
        } catch (error) {
          console.error("PDF parsing error:", error);
          return res.status(400).json({ 
            message: "Failed to parse PDF file. Please ensure it's a valid PDF with readable text." 
          });
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.originalname.toLowerCase().endsWith('.docx')) {
        try {
          const result = await mammoth.extractRawText({buffer: file.buffer});
          fileContent = result.value;
          
          // Estimate pages based on content density
          const wordsPerPage = 500;
          const words = fileContent.split(/\s+/).length;
          actualPages = Math.max(1, Math.ceil(words / wordsPerPage));
          
        } catch (error) {
          console.error("DOCX parsing error:", error);
          return res.status(400).json({ 
            message: "Failed to parse DOCX file. Please ensure it's a valid Word document." 
          });
        }
      }

      // Define page limits per plan
      const pageLimits = {
        free: 50,      // 50 pages
        plus: 200,     // 200 pages  
        pro: 600,      // 600 pages
        premium: 1000  // 1000 pages
      };

      const maxPages = pageLimits[user.accountStatus as keyof typeof pageLimits] || pageLimits.free;
      
      console.log(`Document has ${actualPages} pages, limit is ${maxPages} pages for ${user.accountStatus} plan`);

      if (actualPages > maxPages) {
        return res.json({
          allowed: false,
          reason: `Contract too large for ${user.accountStatus} plan. Document has ${actualPages} pages, but limit is ${maxPages} pages.`,
          actualPages,
          maxPages,
          planLimit: maxPages
        });
      }

      // Calculate token usage for monthly limits
      const textTokens = Math.ceil(fileContent.length / 4);
      const systemPromptTokens = 800;
      const responseTokens = 2000;
      const estimatedTokens = textTokens + systemPromptTokens + responseTokens;

      // Check monthly token limits
      const planLimits = await storage.getPlanLimits(user.accountStatus);
      if (planLimits?.monthlyTokenLimit && planLimits.monthlyTokenLimit > 0) {
        const monthlyUsage = await storage.getUserMonthlyUsage(userId);
        if (monthlyUsage + estimatedTokens > planLimits.monthlyTokenLimit) {
          return res.json({
            allowed: false,
            reason: `Monthly token limit would be exceeded. Estimated tokens needed: ${estimatedTokens}, Available: ${planLimits.monthlyTokenLimit - monthlyUsage}`,
            estimatedTokens,
            actualPages,
            availableTokens: planLimits.monthlyTokenLimit - monthlyUsage
          });
        }
      }

      res.json({
        allowed: true,
        actualPages,
        maxPages,
        estimatedTokens,
        planLimit: maxPages
      });
    } catch (error) {
      console.error("Error validating contract size:", error);
      res.status(500).json({ message: "Failed to validate contract size" });
    }
  });

  // Delete contract
  app.delete('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contractId = parseInt(req.params.id);
      
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Check if user owns the contract
      if (contract.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Delete the contract from database
      await storage.deleteContract(contractId);
      
      res.json({ message: "Contract deleted successfully" });
    } catch (error) {
      console.error("Error deleting contract:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Template routes
  app.get('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      let templates;
      
      if (category) {
        templates = await storage.getTemplatesByCategory(category);
      } else {
        templates = await storage.getTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/contracts/from-template', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { templateId, variables, fileName } = req.body;
      
      if (!templateId || !variables || !fileName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const contract = await storage.createContractFromTemplate(
        templateId,
        userId,
        variables,
        fileName
      );
      
      res.json({ contractId: contract.id, message: "Contract created successfully" });
    } catch (error) {
      console.error("Error creating contract from template:", error);
      res.status(500).json({ message: "Failed to create contract from template" });
    }
  });

  // Clause library routes
  app.get('/api/clauses', isAuthenticated, async (req: any, res) => {
    try {
      const { category, search } = req.query;
      let clauses;
      
      if (search) {
        clauses = await storage.searchClauses(search as string);
      } else if (category) {
        clauses = await storage.getClausesByCategory(category as string);
      } else {
        clauses = await storage.getClauses();
      }
      
      res.json(clauses);
    } catch (error) {
      console.error("Error fetching clauses:", error);
      res.status(500).json({ message: "Failed to fetch clauses" });
    }
  });

  app.get('/api/clauses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const clauseId = parseInt(req.params.id);
      const clause = await storage.getClause(clauseId);
      
      if (!clause) {
        return res.status(404).json({ message: "Clause not found" });
      }
      
      res.json(clause);
    } catch (error) {
      console.error("Error fetching clause:", error);
      res.status(500).json({ message: "Failed to fetch clause" });
    }
  });

  // Translation API routes for automatic translation
  app.post('/api/translate/text', isAuthenticated, async (req: any, res) => {
    try {
      const { text, targetLanguage, context } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ message: "Text and target language are required" });
      }

      if (!['es', 'ar', 'de', 'fr'].includes(targetLanguage)) {
        return res.status(400).json({ message: "Invalid target language" });
      }

      const translation = await translateText({ text, targetLanguage, context });
      res.json(translation);
    } catch (error) {
      console.error("Translation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post('/api/translate/batch', isAuthenticated, async (req: any, res) => {
    try {
      const { text, context } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const translations = await translateToAllLanguages(text, context);
      res.json(translations);
    } catch (error) {
      console.error("Batch translation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Batch translation failed';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post('/api/translate/object', isAuthenticated, async (req: any, res) => {
    try {
      const { englishObject, context } = req.body;
      
      if (!englishObject || typeof englishObject !== 'object') {
        return res.status(400).json({ message: "English object is required" });
      }

      const translations = await translateObjectToAllLanguages(englishObject, context);
      res.json(translations);
    } catch (error) {
      console.error("Object translation error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Object translation failed';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Translation sync API routes
  app.get('/api/translations/sync-status', isAuthenticated, async (req: any, res) => {
    try {
      const reports = await translationSyncService.detectOutOfSyncTranslations();
      
      const summary = {
        totalLanguages: reports.length,
        languagesNeedingSync: reports.filter(r => r.missingKeys.length > 0).length,
        totalMissingKeys: reports.reduce((sum, r) => sum + r.missingKeys.length, 0),
        reports: reports.map(r => ({
          language: r.language,
          missingKeysCount: r.missingKeys.length,
          missingKeys: r.missingKeys
        }))
      };

      res.json(summary);
    } catch (error) {
      console.error("Sync status error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check sync status';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post('/api/translations/auto-sync', isAuthenticated, async (req: any, res) => {
    try {
      const result = await translationSyncService.autoSyncAllLanguages();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'All languages synchronized successfully',
          reports: result.reports.map(r => ({
            language: r.language,
            updatedKeysCount: Object.keys(r.newTranslations).length,
            updatedKeys: Object.keys(r.newTranslations)
          }))
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Synchronization failed'
        });
      }
    } catch (error) {
      console.error("Auto-sync error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Auto-sync failed';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Content translation endpoint for dynamic content (templates, clauses, etc.)
  app.post('/api/translate-content', async (req, res) => {
    try {
      const { text, targetLanguage, context } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and targetLanguage are required' });
      }

      if (targetLanguage === 'en') {
        return res.json({ translatedText: text });
      }

      const result = await translateText({
        text,
        targetLanguage: targetLanguage as 'es' | 'ar' | 'de' | 'fr',
        context: context || 'legal/business content'
      });

      res.json({ translatedText: result.translatedText });
    } catch (error) {
      console.error('Content translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
    }
  });

  // Usage statistics endpoints
  app.get('/api/usage/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserUsageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Usage stats error:', error);
      res.status(500).json({ error: 'Failed to fetch usage statistics' });
    }
  });

  app.get('/api/usage/limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const planType = user.accountStatus || 'free';
      const planLimits = await storage.getPlanLimits(planType);
      
      if (!planLimits) {
        return res.status(404).json({ error: 'Plan limits not found' });
      }

      // Get current usage
      const monthlyUsage = await storage.getUserMonthlyUsage(userId);
      const dailyUsage = await storage.getUserDailyUsage(userId);

      res.json({
        plan: planType,
        limits: {
          monthly: planLimits.monthlyTokenLimit,
          daily: planLimits.dailyTokenLimit,
          operations: planLimits.operationLimits
        },
        usage: {
          monthly: monthlyUsage,
          daily: dailyUsage
        }
      });
    } catch (error) {
      console.error('Usage limits error:', error);
      res.status(500).json({ error: 'Failed to fetch usage limits' });
    }
  });

  // Stripe checkout session routes (allows unauthenticated users)
  app.post('/api/create-checkout-session', async (req: any, res) => {
    try {
      const { planId } = req.body;
      
      if (!planId || planId === 'free') {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }

      // Map plan to Stripe price ID
      const priceIds = {
        'plus': 'price_1Rj2flPqwDXcpBrtJ39fCStw',
        'pro': 'price_1Rj6HEPqwDXcpBrtKKqY5JBI',
        'premium': 'price_1Rj6HiPqwDXcpBrtGH8WqjO8'
      };

      const priceId = priceIds[planId];
      if (!priceId) {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }

      // Check if user is authenticated
      let customerId = null;
      let userId = null;
      
      if (req.user) {
        // Authenticated user - link to existing account
        userId = req.user.id;
        const user = await storage.getUser(userId);
        
        if (user?.stripeCustomerId) {
          customerId = user.stripeCustomerId;
        } else if (user?.email) {
          // Create Stripe customer for existing user
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id }
          });
          customerId = customer.id;
          
          // Update user with Stripe customer ID
          await storage.updateUserSubscription(user.id, {
            accountStatus: user.accountStatus,
            stripeCustomerId: customerId,
            subscriptionExpiresAt: user.subscriptionExpiresAt
          });
        }
      }

      // Create checkout session
      const sessionConfig: any = {
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `https://contract-clarifier-joshuasa300.replit.app/dashboard?success=true`,
        cancel_url: `https://contract-clarifier-joshuasa300.replit.app/pricing?canceled=true`,
        metadata: {
          planId: planId,
          ...(userId && { userId })
        }
      };

      // If we have a customer ID, use it; otherwise Stripe will create one automatically
      if (customerId) {
        sessionConfig.customer = customerId;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.body;
      const user = req.user;

      if (!user || !user.email) {
        return res.status(400).json({ error: 'User email is required' });
      }

      // Plan configurations - All GBP Price IDs from Stripe Dashboard
      const planPrices = {
        plus: 'price_1Rj2flPqwDXcpBrtJ39fCStw',        // £7.99/month
        pro: 'price_1Rj6HEPqwDXcpBrtKKqY5JBI',         // £14.99/month
        premium: 'price_1Rj6HiPqwDXcpBrtGH8WqjO8'      // £39.99/month
      };

      const planPrice = planPrices[planId as keyof typeof planPrices];
      if (!planPrice) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      // Create or get existing customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        
        // Update user with Stripe customer ID
        await storage.updateUserSubscription(user.id, {
          accountStatus: user.accountStatus,
          stripeCustomerId: customer.id
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: planPrice }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook endpoint for handling payment events
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Get customer to find user
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted) break;
          
          // Determine plan type based on price ID
          let planType = 'free';
          if (subscription.status === 'active' && subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            if (priceId === 'price_1Rj2flPqwDXcpBrtJ39fCStw') {
              planType = 'plus';
            } else if (priceId === 'price_1Rj6HEPqwDXcpBrtKKqY5JBI') {
              planType = 'pro';
            } else if (priceId === 'price_1Rj6HiPqwDXcpBrtGH8WqjO8') {
              planType = 'premium';
            }
          }

          // Try to find existing user by customer ID or email
          let userId = customer.metadata?.userId;
          let user = null;
          
          if (userId) {
            user = await storage.getUser(userId);
          } else {
            // Try to find by Stripe customer ID
            user = await storage.getUserByStripeCustomerId(customerId);
            if (!user && customer.email) {
              // Try to find by email
              user = await storage.getUserByEmail(customer.email);
            }
          }

          if (user) {
            // Update existing user
            await storage.updateUserSubscription(user.id, {
              accountStatus: planType,
              stripeCustomerId: customerId,
              subscriptionExpiresAt: new Date(subscription.current_period_end * 1000)
            });
          } else if (customer.email) {
            // Create new user account from Stripe customer data
            const newUser = await storage.createUser({
              id: `stripe_${customerId}`,
              email: customer.email,
              firstName: customer.name?.split(' ')[0] || '',
              lastName: customer.name?.split(' ').slice(1).join(' ') || '',
              accountStatus: planType,
              stripeCustomerId: customerId,
              subscriptionExpiresAt: new Date(subscription.current_period_end * 1000)
            });
            
            // Update Stripe customer metadata with new user ID
            await stripe.customers.update(customerId, {
              metadata: { userId: newUser.id }
            });
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          const deletedCustomerId = deletedSub.customer as string;
          
          const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId);
          if (deletedCustomer.deleted) break;
          
          const deletedUserId = deletedCustomer.metadata?.userId;
          if (!deletedUserId) break;

          await storage.updateUserSubscription(deletedUserId, {
            accountStatus: 'free',
            stripeCustomerId: deletedCustomerId,
            subscriptionExpiresAt: null
          });
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          console.log('Payment succeeded for invoice:', invoice.id);
          
          if (invoice.customer && invoice.subscription) {
            const successCustomer = await stripe.customers.retrieve(invoice.customer as string);
            if (!successCustomer.deleted) {
              const successUserId = successCustomer.metadata?.userId;
              let userToRestore = null;
              
              if (successUserId) {
                userToRestore = await storage.getUser(successUserId);
              } else {
                // Fallback: try to find user by Stripe customer ID
                userToRestore = await storage.getUserByStripeCustomerId(invoice.customer as string);
              }
              
              if (userToRestore) {
                // Get the subscription to determine plan type
                const successSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
                
                // Determine plan type based on price ID
                let planType = 'free';
                if (successSubscription.status === 'active' && successSubscription.items.data.length > 0) {
                  const priceId = successSubscription.items.data[0].price.id;
                  if (priceId === 'price_1Rj2flPqwDXcpBrtJ39fCStw') {
                    planType = 'plus';
                  } else if (priceId === 'price_1Rj6HEPqwDXcpBrtKKqY5JBI') {
                    planType = 'pro';
                  } else if (priceId === 'price_1Rj6HiPqwDXcpBrtGH8WqjO8') {
                    planType = 'premium';
                  }
                }
                
                // Restore user access by updating their plan
                await storage.updateUserSubscription(userToRestore.id, {
                  accountStatus: planType,
                  subscriptionExpiresAt: new Date(successSubscription.current_period_end * 1000),
                });
                
                console.log(`Payment succeeded - restored user ${userToRestore.email} to ${planType} plan`);
              }
            }
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          console.log('Payment failed for invoice:', failedInvoice.id);
          
          if (failedInvoice.customer && failedInvoice.subscription) {
            const failedCustomer = await stripe.customers.retrieve(failedInvoice.customer as string);
            if (!failedCustomer.deleted) {
              const failedUserId = failedCustomer.metadata?.userId;
              if (failedUserId) {
                // Set user to null status - complete lockout until payment is resolved
                await storage.updateUserSubscription(failedUserId, {
                  accountStatus: 'null',
                  subscriptionExpiresAt: null,
                });
                
                console.log(`Payment failed - locked out user with null status (Customer: ${failedInvoice.customer})`);
              } else {
                // Fallback: try to find user by Stripe customer ID
                const failedPaymentUser = await storage.getUserByStripeCustomerId(failedInvoice.customer as string);
                if (failedPaymentUser) {
                  await storage.updateUserSubscription(failedPaymentUser.id, {
                    accountStatus: 'null',
                    subscriptionExpiresAt: null,
                  });
                  
                  console.log(`Payment failed - locked out user ${failedPaymentUser.email} with null status`);
                }
              }
            }
          }
          break;

        // Handle subscription payment failures (different from invoice failures)
        case 'customer.subscription.payment_failed':
          const failedSubscription = event.data.object as Stripe.Subscription;
          console.log('Subscription payment failed:', failedSubscription.id);
          
          if (failedSubscription.customer) {
            const failedSubCustomer = await stripe.customers.retrieve(failedSubscription.customer as string);
            if (!failedSubCustomer.deleted) {
              const failedSubUserId = failedSubCustomer.metadata?.userId;
              if (failedSubUserId) {
                // Set user to null status - complete lockout until payment is resolved
                await storage.updateUserSubscription(failedSubUserId, {
                  accountStatus: 'null',
                  subscriptionExpiresAt: null,
                });
                
                console.log(`Subscription payment failed - locked out user with null status (Customer: ${failedSubscription.customer})`);
              } else {
                // Fallback: try to find user by Stripe customer ID
                const failedSubscriptionUser = await storage.getUserByStripeCustomerId(failedSubscription.customer as string);
                if (failedSubscriptionUser) {
                  await storage.updateUserSubscription(failedSubscriptionUser.id, {
                    accountStatus: 'null',
                    subscriptionExpiresAt: null,
                  });
                  
                  console.log(`Subscription payment failed - locked out user ${failedSubscriptionUser.email} with null status`);
                }
              }
            }
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
