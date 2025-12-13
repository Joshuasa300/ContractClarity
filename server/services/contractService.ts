/**
 * Contract Service Layer
 * Handles all contract-related business logic
 */

import { storage } from '../storage';
import { analyzeContract } from './openai';
import { detectContractLanguage } from './languageDetection';
import { 
  ContractNotFoundError, 
  AuthorizationError, 
  UsageLimitError,
  FileTooLargeError,
  InvalidFileTypeError,
  AnalysisFailedError,
  createFileValidationError
} from '../lib/errors';
import { validateFile } from '../lib/validation';
import type { Contract, User } from '@shared/schema';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';

export interface FileUpload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ContractAnalysisResult {
  summary: string;
  riskAssessment: {
    high: Array<{ title: string; description: string }>;
    medium: Array<{ title: string; description: string }>;
    low: Array<{ title: string; description: string }>;
  };
  keyTerms: Array<{
    category: string;
    title: string;
    description: string;
    riskLevel: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{ action: string; priority: 'high' | 'medium' | 'low' }>;
}

export class ContractService {
  /**
   * Upload and create a new contract
   */
  async uploadContract(file: FileUpload, userId: string): Promise<Contract> {
    // Validate file
    const fileValidationError = createFileValidationError(file);
    if (fileValidationError) {
      throw fileValidationError;
    }

    // Get user and check payment status
    const user = await storage.getUser(userId);
    if (!user) {
      throw new AuthorizationError('User not found');
    }

    if (user.paymentFailed) {
      throw new UsageLimitError(
        'contract_upload',
        0,
        0,
        'Your payment method failed. Please update your payment details to continue uploading contracts.'
      );
    }

    // Check usage limits
    const usageCheck = await storage.checkUsageLimit(userId, 'contract_analysis');
    if (!usageCheck.allowed) {
      throw new UsageLimitError('contract_analysis', usageCheck.limit, usageCheck.current);
    }

    // Extract file content
    const fileContent = await this.extractFileContent(file);
    
    if (!fileContent.trim()) {
      throw new AnalysisFailedError('File appears to be empty or unreadable');
    }

    // Create contract record
    const contractData = {
      userId,
      fileName: file.originalname,
      fileContent,
      analysisComplete: false,
    };

    const contract = await storage.createContract(contractData);
    
    // Queue analysis for background processing
    // Note: In a production environment, you'd use a proper job queue like Bull or Agenda
    this.queueContractAnalysis(contract.id).catch(error => {
      console.error('Background analysis failed:', error);
    });

    return contract;
  }

  /**
   * Get contract by ID with ownership validation
   */
  async getContract(contractId: number, userId: string): Promise<Contract> {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new ContractNotFoundError(contractId);
    }

    if (contract.userId !== userId) {
      throw new AuthorizationError('Access denied to this contract');
    }

    return contract;
  }

  /**
   * Get all contracts for a user
   */
  async getUserContracts(userId: string): Promise<Contract[]> {
    return await storage.getUserContracts(userId);
  }

  /**
   * Delete a contract with ownership validation
   */
  async deleteContract(contractId: number, userId: string): Promise<void> {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new ContractNotFoundError(contractId);
    }

    if (contract.userId !== userId) {
      throw new AuthorizationError('Access denied to this contract');
    }

    await storage.deleteContract(contractId);
  }

  /**
   * Trigger contract analysis manually
   */
  async analyzeContract(contractId: number, userId: string): Promise<Contract> {
    const contract = await this.getContract(contractId, userId);
    
    if (contract.analysisComplete) {
      return contract; // Already analyzed
    }

    // Check usage limits
    const usageCheck = await storage.checkUsageLimit(userId, 'contract_analysis');
    if (!usageCheck.allowed) {
      throw new UsageLimitError('contract_analysis', usageCheck.limit, usageCheck.current);
    }

    // Perform analysis
    await this.processContractAnalysis(contractId);
    
    // Return updated contract
    const updatedContract = await storage.getContract(contractId);
    if (!updatedContract) {
      throw new ContractNotFoundError(contractId);
    }

    return updatedContract;
  }

  /**
   * Validate contract size and return analysis
   */
  async validateContractSize(file: FileUpload, userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    actualPages?: number;
    maxPages?: number;
    estimatedTokens?: number;
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new AuthorizationError('User not found');
    }

    // Extract content and count pages
    let actualPages = 1;
    let fileContent = '';

    try {
      if (file.mimetype === 'text/plain') {
        fileContent = file.buffer.toString('utf-8');
        const lines = fileContent.split('\n').length;
        actualPages = Math.max(1, Math.ceil(lines / 50)); // 50 lines per page
      } else if (file.mimetype === 'application/pdf') {
        const pdfInfo = await this.parsePDF(file.buffer);
        actualPages = pdfInfo.pageCount;
        fileContent = pdfInfo.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        fileContent = result.value;
        const words = fileContent.split(/\s+/).length;
        actualPages = Math.max(1, Math.ceil(words / 500)); // 500 words per page
      }
    } catch (error) {
      throw new AnalysisFailedError('Failed to parse document for size validation');
    }

    // Define page limits per plan
    const pageLimits = {
      free: 50,
      plus: 200,
      pro: 600,
      premium: 1000
    };

    const maxPages = pageLimits[user.accountStatus as keyof typeof pageLimits] || pageLimits.free;

    if (actualPages > maxPages) {
      return {
        allowed: false,
        reason: `Contract too large for ${user.accountStatus} plan. Document has ${actualPages} pages, but limit is ${maxPages} pages.`,
        actualPages,
        maxPages
      };
    }

    // Calculate estimated token usage
    const textTokens = Math.ceil(fileContent.length / 4);
    const systemPromptTokens = 800;
    const responseTokens = 2000;
    const estimatedTokens = textTokens + systemPromptTokens + responseTokens;

    return {
      allowed: true,
      actualPages,
      maxPages,
      estimatedTokens
    };
  }

  /**
   * Extract text content from uploaded file
   */
  private async extractFileContent(file: FileUpload): Promise<string> {
    let fileContent = '';

    if (file.mimetype === 'text/plain') {
      fileContent = file.buffer.toString('utf-8');
    } else if (file.mimetype === 'application/pdf') {
      const pdfInfo = await this.parsePDF(file.buffer);
      fileContent = pdfInfo.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      fileContent = result.value;
      
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX parsing warnings:', result.messages);
      }
    } else {
      throw new InvalidFileTypeError(file.mimetype, [
        'application/pdf',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]);
    }

    return fileContent;
  }

  /**
   * Parse PDF and extract text with page count
   */
  private async parsePDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new AnalysisFailedError(`PDF parsing error: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          let text = '';
          let pageCount = 0;
          
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
          reject(new AnalysisFailedError(`Text extraction error: ${parseError}`));
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
  }

  /**
   * Process contract analysis (can be called synchronously or asynchronously)
   */
  private async processContractAnalysis(contractId: number): Promise<void> {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new ContractNotFoundError(contractId);
    }

    if (contract.analysisComplete) {
      return; // Already analyzed
    }

    // Check usage limits
    const usageCheck = await storage.checkUsageLimit(contract.userId, 'contract_analysis');
    if (!usageCheck.allowed) {
      throw new UsageLimitError('contract_analysis', usageCheck.limit, usageCheck.current);
    }

    // Detect language
    const languageDetection = detectContractLanguage(contract.fileContent);
    
    // Update contract with language info
    await storage.updateContractLanguage(contractId, {
      detectedLanguage: languageDetection.detectedLanguage,
      analysisLanguage: languageDetection.detectedLanguage,
      languageConfidence: languageDetection.confidence,
    });

    // Perform AI analysis
    const analysis = await analyzeContract(
      contract.fileContent,
      languageDetection.detectedLanguage,
      contract.userId
    );
    
    // Update contract with analysis results
    await storage.updateContractAnalysis(contractId, analysis);
  }

  /**
   * Queue contract analysis for background processing
   * In production, this would use a proper job queue
   */
  private async queueContractAnalysis(contractId: number): Promise<void> {
    // Simple setTimeout for demo - replace with proper job queue in production
    setTimeout(async () => {
      try {
        await this.processContractAnalysis(contractId);
        console.log(`✅ Contract analysis completed for contract ${contractId}`);
      } catch (error) {
        console.error(`❌ Contract analysis failed for contract ${contractId}:`, error);
        
        // In production, you might want to:
        // 1. Retry the job with exponential backoff
        // 2. Send notification to user about failure
        // 3. Log to monitoring service
      }
    }, 1000); // 1 second delay to simulate async processing
  }
}

// Export singleton instance
export const contractService = new ContractService();