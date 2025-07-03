import { analyzeContract } from "./openai";
import { storage } from "../storage";

export async function processContractAnalysis(contractId: number): Promise<void> {
  try {
    const contract = await storage.getContract(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    if (contract.analysisComplete) {
      return; // Already analyzed
    }

    const analysis = await analyzeContract(contract.fileContent);
    
    await storage.updateContractAnalysis(contractId, analysis);
  } catch (error) {
    console.error("Contract analysis error:", error);
    throw error;
  }
}
