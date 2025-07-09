import { analyzeContract } from "./openai";
import { storage } from "../storage";
import { detectContractLanguage, type LanguageDetectionResult } from "./languageDetection";

export async function processContractAnalysis(contractId: number): Promise<void> {
  try {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    if (contract.analysisComplete) {
      return; // Already analyzed
    }

    // Check usage limits before processing
    const usageCheck = await storage.checkUsageLimit(contract.userId, 'contract_analysis');
    if (!usageCheck.allowed) {
      // Throw specific error to trigger upgrade modal on frontend
      throw new Error(`USAGE_LIMIT_EXCEEDED:${usageCheck.limit}:contract_analysis`);
    }

    // Detect the language of the contract
    const languageDetection = detectContractLanguage(contract.fileContent);
    
    // Update contract with detected language information
    await storage.updateContractLanguage(contractId, {
      detectedLanguage: languageDetection.detectedLanguage,
      analysisLanguage: languageDetection.detectedLanguage,
      languageConfidence: languageDetection.confidence,
    });

    // Perform analysis in the detected language
    const analysis = await analyzeContract(
      contract.fileContent, 
      languageDetection.detectedLanguage,
      contract.userId
    );
    
    await storage.updateContractAnalysis(contractId, analysis);
  } catch (error) {
    console.error("Contract analysis error:", error);
    throw error;
  }
}
