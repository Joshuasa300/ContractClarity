import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContractSchema } from "@shared/schema";
import { processContractAnalysis } from "./services/contractAnalysis";
import multer from "multer";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contract routes
  app.post('/api/contracts', isAuthenticated, upload.single('contract'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text content based on file type
      let fileContent = "";
      if (file.mimetype === 'text/plain') {
        fileContent = file.buffer.toString('utf-8');
      } else if (file.mimetype === 'application/pdf') {
        // For PDF files, we'd need a PDF parser library
        // For now, we'll return an error asking for text files
        return res.status(400).json({ 
          message: "PDF parsing not implemented yet. Please upload a plain text file (.txt) for now." 
        });
      } else {
        return res.status(400).json({ 
          message: "Unsupported file type. Please upload a plain text file (.txt) for now." 
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
      const userId = req.user.claims.sub;
      const contracts = await storage.getUserContracts(userId);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
