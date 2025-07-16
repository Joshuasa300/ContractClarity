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
import bcrypt from "bcryptjs";
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

  // Support contact form endpoint
  app.post("/api/support/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          message: "All fields are required" 
        });
      }

      // Send email to support team
      const emailSent = await emailService.sendSupportEmail({
        from: email,
        fromName: name,
        subject: subject,
        message: message,
        to: "info@contractclarity.co.uk"
      });

      if (!emailSent) {
        return res.status(500).json({ 
          message: "Failed to send support email" 
        });
      }

      res.json({ 
        message: "Support email sent successfully" 
      });
    } catch (error) {
      console.error("Support contact error:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
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
        success_url: `${req.protocol}://${req.get('host')}/?success=true`,
        cancel_url: `${req.protocol}://${req.get('host')}/pricing?canceled=true`,
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

  // Test endpoint to verify webhook connectivity
  app.get('/api/webhook-test', (req, res) => {
    console.log('🔧 Webhook test endpoint called');
    res.json({ 
      status: 'Webhook endpoint is reachable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY
    });
  });

  // Debug endpoint to manually check user status
  app.get('/api/debug/user/:email', async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('🔍 Debug user lookup:', user.email, 'Status:', user.accountStatus);
      res.json({
        id: user.id,
        email: user.email,
        accountStatus: user.accountStatus,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Manual webhook trigger for testing - allows forcing a user to a specific plan
  app.post('/api/debug/force-plan/:email/:plan', async (req, res) => {
    try {
      const { email, plan } = req.params;
      console.log(`🔧 Manual plan override: ${email} -> ${plan}`);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.updateUserSubscription(user.id, {
        accountStatus: plan,
        subscriptionExpiresAt: plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      console.log(`✅ Successfully updated ${email} to ${plan} plan`);
      res.json({ 
        success: true, 
        message: `User ${email} updated to ${plan} plan`,
        user: {
          email: user.email,
          newPlan: plan
        }
      });
    } catch (error) {
      console.error('Manual plan update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Email verification routes - New approach: only create account after verification
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Check if there's already a pending registration
      const existingPending = await storage.getPendingRegistration(email);
      if (existingPending) {
        // Delete old pending registration to allow new one
        await storage.deletePendingRegistration(email);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate 6-digit verification code
      const { emailService } = await import('./services/emailService');
      const verificationCode = emailService.generateVerificationCode();

      // Create pending registration (not actual user yet)
      const { id, expiresAt } = await storage.createPendingRegistration({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        password: hashedPassword,
        verificationCode,
      });

      // Send verification email with 6-digit code
      const emailSent = await emailService.sendVerificationEmail({
        to: email,
        firstName: firstName || '',
        verificationCode,
      });

      if (!emailSent) {
        console.error('Failed to send verification email during registration');
        // Don't fail registration, user can resend later
      }

      console.log('✅ Pending registration created, verification email sent:', email);
      res.status(201).json({
        message: 'Registration initiated. Please check your email for a 6-digit verification code.',
        requiresVerification: true,
        email: email,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required' });
      }

      // Complete pending registration with 6-digit code
      const result = await storage.completePendingRegistration(email, code);

      if (result.success && result.user) {
        console.log('✅ Email verified and user created successfully:', email);
        
        // Automatically log in the user
        req.login(result.user, (err) => {
          if (err) {
            console.error('Auto-login error after verification:', err);
            return res.json({
              message: 'Email verified successfully. Please sign in.',
              success: true,
              user: {
                id: result.user!.id,
                email: result.user!.email,
                firstName: result.user!.firstName,
                lastName: result.user!.lastName,
              }
            });
          }
          
          res.json({
            message: 'Email verified and account created successfully',
            success: true,
            autoLogin: true,
            user: {
              id: result.user!.id,
              email: result.user!.email,
              firstName: result.user!.firstName,
              lastName: result.user!.lastName,
              accountStatus: result.user!.accountStatus,
            }
          });
        });
      } else {
        res.status(400).json({
          message: 'Invalid or expired verification code',
          success: false,
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user already exists (email already verified)
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered and verified' });
      }

      // Check for pending registration
      const pendingReg = await storage.getPendingRegistration(email);
      if (!pendingReg) {
        return res.status(404).json({ message: 'No pending registration found for this email' });
      }

      // Check rate limiting - only allow resend if created more than 60 seconds ago
      const timeSinceCreation = Date.now() - pendingReg.createdAt.getTime();
      if (timeSinceCreation < 60 * 1000) {
        return res.status(429).json({ 
          message: 'Please wait 60 seconds before requesting another verification code' 
        });
      }

      // Generate new verification code
      const { emailService } = await import('./services/emailService');
      const newVerificationCode = emailService.generateVerificationCode();

      // Update pending registration with new code
      await storage.deletePendingRegistration(email);
      await storage.createPendingRegistration({
        email: pendingReg.email,
        firstName: pendingReg.firstName || undefined,
        lastName: pendingReg.lastName || undefined,
        password: pendingReg.password, // Already hashed
        verificationCode: newVerificationCode,
      });

      // Send new verification email
      const emailSent = await emailService.sendVerificationEmail({
        to: email,
        firstName: pendingReg.firstName || '',
        verificationCode: newVerificationCode,
      });

      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      console.log('✅ Verification code resent for pending registration:', email);
      res.json({
        message: 'New verification code sent successfully',
        success: true,
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/auth/verification-status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        emailVerified: user.emailVerified,
        email: user.email,
        authProvider: user.authProvider,
      });
    } catch (error) {
      console.error('Verification status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Local authentication login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || user.authProvider !== 'local') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check email verification for local auth users
      if (!user.emailVerified) {
        return res.status(403).json({ message: 'EMAIL_NOT_VERIFIED' });
      }

      // Log in the user by creating a session
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }
        
        console.log('✅ User logged in successfully:', user.email);
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
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Stripe webhook endpoint for handling payment events
  // Note: Raw body parsing is handled in server/index.ts for this route
  app.post('/api/webhook', async (req, res) => {
    console.log('📥 Webhook received at /api/webhook at', new Date().toISOString());
    console.log('📊 Request headers:', Object.keys(req.headers));
    console.log('📏 Body size:', req.body?.length || 0, 'bytes');
    console.log('🔍 Body type:', typeof req.body);
    console.log('🔍 Body is Buffer:', Buffer.isBuffer(req.body));
    
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      console.error('❌ No Stripe signature found in headers');
      return res.status(400).send('Missing Stripe signature');
    }
    
    let event: Stripe.Event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).send('Webhook secret not configured');
      }
      
      // Ensure we have the raw body as Buffer or string
      let payload = req.body;
      if (!Buffer.isBuffer(payload) && typeof payload !== 'string') {
        console.error('❌ Invalid payload type:', typeof payload);
        return res.status(400).send('Invalid payload format');
      }
      
      console.log('🔐 Attempting webhook verification...');
      console.log('🔑 Webhook secret length:', process.env.STRIPE_WEBHOOK_SECRET.length);
      console.log('📝 Signature:', sig.substring(0, 50) + '...');
      
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log('✅ Webhook signature verified successfully!');
      console.log('📋 Event type:', event.type);
      console.log('📋 Event ID:', event.id);
      console.log('📅 Event created:', new Date(event.created * 1000).toISOString());
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      console.error('🔍 Error type:', err.constructor.name);
      console.error('🔍 Webhook secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
      console.error('🔍 Signature received:', sig ? 'Yes' : 'No');
      console.error('🔍 Payload type:', typeof req.body);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('💳 Checkout session completed:', session.id);
          console.log('💰 Payment status:', session.payment_status);
          console.log('👤 Customer:', session.customer);
          
          if (session.payment_status === 'paid' && session.customer) {
            // Get customer details
            const customer = await stripe.customers.retrieve(session.customer as string);
            if (customer.deleted) break;
            
            // Get subscription if it exists
            let subscription = null;
            if (session.subscription) {
              subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            }
            
            // Determine plan type from session metadata or subscription
            let planType = 'free';
            if (subscription && subscription.status === 'active' && subscription.items.data.length > 0) {
              const priceId = subscription.items.data[0].price.id;
              console.log('💰 Checkout processing price ID:', priceId);
              
              if (priceId === 'price_1Rj2flPqwDXcpBrtJ39fCStw') {
                planType = 'plus';
              } else if (priceId === 'price_1Rj6HEPqwDXcpBrtKKqY5JBI') {
                planType = 'pro';
              } else if (priceId === 'price_1Rj6HiPqwDXcpBrtGH8WqjO8') {
                planType = 'premium';
              }
            }
            
            console.log('📋 Checkout determined plan type:', planType);
            
            // Find or create user
            let user = await storage.getUserByStripeCustomerId(customer.id);
            if (!user && customer.email) {
              user = await storage.getUserByEmail(customer.email);
            }
            
            if (user) {
              console.log('👤 Checkout updating existing user:', user.email, 'to plan:', planType);
              
              // Check if this is an upgrade (from free/null to paid plan)
              const isUpgrade = (user.accountStatus === 'free' || user.accountStatus === 'null') && 
                               (planType === 'plus' || planType === 'pro' || planType === 'premium');
              
              if (isUpgrade) {
                console.log('🔄 Detected upgrade - resetting usage for user:', user.email);
              }
              
              await storage.updateUserSubscription(user.id, {
                accountStatus: planType,
                stripeCustomerId: customer.id,
                subscriptionExpiresAt: subscription ? new Date(subscription.current_period_end * 1000) : null
              }, isUpgrade);
              console.log('✅ Checkout subscription update successful');
            } else if (customer.email) {
              console.log('🆕 Checkout creating new user from customer:', customer.email);
              const newUser = await storage.createUser({
                id: `stripe_${customer.id}`,
                email: customer.email,
                firstName: customer.name?.split(' ')[0] || '',
                lastName: customer.name?.split(' ').slice(1).join(' ') || '',
                accountStatus: planType,
                stripeCustomerId: customer.id,
                subscriptionExpiresAt: subscription ? new Date(subscription.current_period_end * 1000) : null
              });
              
              // Update Stripe customer metadata
              await stripe.customers.update(customer.id, {
                metadata: { userId: newUser.id }
              });
              console.log('✅ Checkout new user created successfully');
            }
          }
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          console.log('🔄 Processing subscription event:', event.type, 'for customer:', customerId);
          
          // Get customer to find user
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted) break;
          
          // Determine plan type based on price ID
          let planType = 'free';
          if (subscription.status === 'active' && subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            console.log('💰 Processing price ID:', priceId, 'with status:', subscription.status);
            
            // Log all price IDs for debugging
            console.log('🎯 Checking against known price IDs:');
            console.log('   Plus: price_1Rj2flPqwDXcpBrtJ39fCStw');
            console.log('   Pro: price_1Rj6HEPqwDXcpBrtKKqY5JBI'); 
            console.log('   Premium: price_1Rj6HiPqwDXcpBrtGH8WqjO8');
            
            if (priceId === 'price_1Rj2flPqwDXcpBrtJ39fCStw') {
              planType = 'plus';
              console.log('✅ Matched Plus plan');
            } else if (priceId === 'price_1Rj6HEPqwDXcpBrtKKqY5JBI') {
              planType = 'pro';
              console.log('✅ Matched Pro plan');
            } else if (priceId === 'price_1Rj6HiPqwDXcpBrtGH8WqjO8') {
              planType = 'premium';
              console.log('✅ Matched Premium plan');
            } else {
              console.log('❌ Unknown price ID - keeping free plan');
            }
            console.log('📋 Determined plan type:', planType);
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
            console.log('👤 Found existing user:', user.email, 'updating to plan:', planType);
            console.log('📅 Subscription period end:', subscription.current_period_end);
            
            const expirationDate = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
            console.log('📅 Calculated expiration date:', expirationDate);
            
            // Check if this is an upgrade (from free/null to paid plan)
            const isUpgrade = (user.accountStatus === 'free' || user.accountStatus === 'null') && 
                             (planType === 'plus' || planType === 'pro' || planType === 'premium');
            
            if (isUpgrade) {
              console.log('🔄 Detected upgrade - resetting usage for user:', user.email);
            }
            
            try {
              console.log('💾 Attempting database update with:', {
                userId: user.id,
                accountStatus: planType,
                stripeCustomerId: customerId,
                subscriptionExpiresAt: expirationDate,
                resetUsage: isUpgrade
              });
              
              // Update existing user
              await storage.updateUserSubscription(user.id, {
                accountStatus: planType,
                stripeCustomerId: customerId,
                subscriptionExpiresAt: expirationDate
              }, isUpgrade);
              console.log('✅ User subscription updated successfully');
            } catch (updateError) {
              console.error('❌ Failed to update user subscription:', updateError);
              console.error('❌ Update error details:', {
                name: updateError.name,
                message: updateError.message,
                stack: updateError.stack
              });
              throw updateError;
            }
          } else if (customer.email) {
            console.log('🆕 Creating new user from Stripe customer:', customer.email);
            try {
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
              console.log('✅ New user created successfully');
            } catch (createError) {
              console.error('❌ Failed to create new user:', createError);
              throw createError;
            }
          } else {
            console.log('❌ No user found and no email provided');
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const cancelledCustomerId = deletedSubscription.customer as string;
          
          console.log('🚫 Subscription cancelled/deleted for customer:', cancelledCustomerId);
          console.log('🚫 Subscription ID:', deletedSubscription.id);
          console.log('🚫 Cancellation details:', deletedSubscription.cancellation_details);
          console.log('🚫 Status:', deletedSubscription.status);
          
          // Get customer details
          const deletedCustomer = await stripe.customers.retrieve(cancelledCustomerId);
          if (deletedCustomer.deleted) {
            console.log('⚠️ Customer was also deleted:', cancelledCustomerId);
            break;
          }
          
          // Find user by customer ID or metadata
          let cancelledUser = null;
          const deletedUserId = deletedCustomer.metadata?.userId;
          
          if (deletedUserId) {
            cancelledUser = await storage.getUser(deletedUserId);
          } else {
            // Fallback: try to find by Stripe customer ID
            cancelledUser = await storage.getUserByStripeCustomerId(cancelledCustomerId);
          }

          if (cancelledUser) {
            console.log('⬇️ Downgrading user to free plan due to subscription cancellation:', cancelledUser.email);
            console.log('📅 Previous plan:', cancelledUser.accountStatus);
            
            await storage.updateUserSubscription(cancelledUser.id, {
              accountStatus: 'free',
              stripeCustomerId: cancelledUser.stripeCustomerId,
              subscriptionExpiresAt: null
            });
            
            console.log('✅ User successfully downgraded to free plan:', cancelledUser.email);
          } else {
            console.warn('⚠️ Could not find user for cancelled subscription. Customer ID:', cancelledCustomerId);
            console.warn('⚠️ Customer email:', deletedCustomer.email);
            console.warn('⚠️ Customer metadata:', deletedCustomer.metadata);
          }
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



        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      console.log('✅ Webhook processed successfully');
      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
