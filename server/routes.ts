import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertContractSchema } from "@shared/schema";
import { processContractAnalysis } from "./services/contractAnalysis";
import { translateText, translateToAllLanguages, translateObjectToAllLanguages } from "./services/translationService";
import { translationSyncService } from "./services/translationSync";
import multer from "multer";
import { z } from "zod";
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

  const httpServer = createServer(app);
  return httpServer;
}
