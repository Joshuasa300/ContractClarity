// Quick script to trigger analysis for pending contracts
import { processContractAnalysis } from "./server/services/contractAnalysis.js";

console.log("Triggering analysis for contract ID 1...");
try {
  await processContractAnalysis(1);
  console.log("Analysis completed for contract 1");
} catch (error) {
  console.error("Analysis failed:", error.message);
}