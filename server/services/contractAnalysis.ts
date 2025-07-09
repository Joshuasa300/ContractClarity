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
      // Store upgrade message instead of throwing error
      const upgradeMessage = {
        summary: "Usage limit exceeded. Please upgrade your plan to continue analyzing contracts.",
        riskAssessment: {
          high: [{
            title: "Upgrade Required",
            description: `You've reached your limit of ${usageCheck.limit} contract analyses. Upgrade to Plus (£7.99/month) for 20 daily analyses, Pro (£14.99/month) for 100 daily analyses, or Premium (£39.99/month) for 500 daily analyses.`
          }],
          medium: [],
          low: []
        },
        keyTerms: [{
          title: "Subscription Plans Available",
          category: "Upgrade Options",
          riskLevel: "medium",
          description: "Choose from Plus, Pro, or Premium plans to unlock unlimited contract analysis with advanced AI features."
        }],
        recommendations: [{
          action: "Upgrade to a paid plan to continue using ContractAI's advanced analysis features.",
          priority: "high"
        }]
      };
      
      await storage.updateContractAnalysis(contractId, upgradeMessage);
      return;
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
