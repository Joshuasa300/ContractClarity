import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Language-specific prompt generation
function getLanguageSpecificPrompt(language: string): string {
  const basePrompt = `You are a legal contract analysis expert. Analyze the provided contract and provide a comprehensive analysis in JSON format with the following structure:

{
  "summary": "A clear, plain-language summary of the contract (2-3 paragraphs)",
  "riskAssessment": {
    "high": [{"title": "Risk Title", "description": "Risk description"}],
    "medium": [{"title": "Risk Title", "description": "Risk description"}],
    "low": [{"title": "Risk Title", "description": "Risk description"}]
  },
  "keyTerms": [
    {
      "category": "Compensation|Work Schedule|Benefits|Termination|etc",
      "title": "Term title",
      "description": "Term description",
      "riskLevel": "high|medium|low"
    }
  ],
  "recommendations": [
    {
      "action": "Specific action to take",
      "priority": "high|medium|low"
    }
  ]
}

Focus on:
1. Clear, jargon-free language
2. Practical implications for the signer
3. Potential risks and red flags
4. Actionable recommendations
5. Key financial, legal, and operational terms`;

  const languageInstructions = {
    'en': '',
    'es': '\n\nIMPORTANT: Provide ALL analysis results in Spanish. Use professional legal terminology appropriate for Spanish-speaking jurisdictions (Spain, Mexico, Argentina, etc.). Consider civil law tradition and specific legal concepts like "responsabilidad civil", "fuerza mayor", "resolución contractual". Use formal register appropriate for legal documents.',
    'fr': '\n\nIMPORTANT: Provide ALL analysis results in French. Use professional legal terminology appropriate for French-speaking jurisdictions (France, Belgium, etc.). Consider civil law tradition and French legal concepts like "responsabilité civile", "force majeure", "résiliation de contrat". Use formal register appropriate for legal documents.',
    'de': '\n\nIMPORTANT: Provide ALL analysis results in German. Use professional legal terminology appropriate for German-speaking jurisdictions (Germany, Austria, Switzerland). Consider German legal concepts like "Haftung", "höhere Gewalt", "Kündigung", "Vertragsbruch". Use formal register appropriate for German legal documents.',
    'ar': '\n\nIMPORTANT: Provide ALL analysis results in Arabic. Use professional legal terminology appropriate for Arabic-speaking jurisdictions. Consider Islamic law principles where applicable and Arabic legal concepts like "مسؤولية", "قوة قاهرة", "فسخ العقد", "إخلال تعاقدي". Format text properly for right-to-left reading. Use formal Arabic register appropriate for legal documents.'
  };

  return basePrompt + (languageInstructions[language as keyof typeof languageInstructions] || languageInstructions['en']);
}

// Function to estimate token usage for a contract
function estimateTokenUsage(contractText: string): number {
  // Rough estimation: ~4 characters per token for English, varies by language
  // Add overhead for system prompt and response
  const textTokens = Math.ceil(contractText.length / 4);
  const systemPromptTokens = 800; // Estimated tokens for our system prompt
  const responseTokens = 2000; // Estimated tokens for analysis response
  
  return textTokens + systemPromptTokens + responseTokens;
}

// Function to check if contract size is within reasonable limits
function validateContractSize(contractText: string, userPlan: string): { allowed: boolean; reason?: string; estimatedTokens: number } {
  const estimatedTokens = estimateTokenUsage(contractText);
  
  // Define size limits per plan (in tokens)
  const tokenLimits = {
    free: 50000,      // ~125 pages (400 tokens per page)
    plus: 200000,     // ~500 pages  
    pro: 500000,      // ~1250 pages
    premium: 1000000  // ~2500 pages
  };
  
  const limit = tokenLimits[userPlan as keyof typeof tokenLimits] || tokenLimits.free;
  
  if (estimatedTokens > limit) {
    const maxPages = Math.floor(limit / 400); // Roughly 400 tokens per page
    return {
      allowed: false,
      reason: `Contract too large for ${userPlan} plan. Estimated ${Math.ceil(estimatedTokens / 400)} pages, but limit is ${maxPages} pages.`,
      estimatedTokens
    };
  }
  
  return { allowed: true, estimatedTokens };
}

export async function analyzeContract(
  contractText: string, 
  analysisLanguage: string = 'en',
  userId?: string
): Promise<{
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
}> {
  try {
    // Check usage limits before making API call
    if (userId) {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate contract size based on user's plan
      const sizeValidation = validateContractSize(contractText, user.accountStatus);
      if (!sizeValidation.allowed) {
        throw new Error(sizeValidation.reason);
      }

      // Check operation-based usage limits
      const usageCheck = await storage.checkUsageLimit(userId, 'contract_analysis');
      if (!usageCheck.allowed) {
        throw new Error(`Usage limit exceeded. Monthly limit: ${usageCheck.limit}, Current usage: ${usageCheck.current}`);
      }

      // Check token-based limits for the estimated usage
      const planLimits = await storage.getPlanLimits(user.accountStatus);
      if (planLimits?.monthlyTokenLimit && planLimits.monthlyTokenLimit > 0) {
        const monthlyUsage = await storage.getUserMonthlyUsage(userId);
        if (monthlyUsage + sizeValidation.estimatedTokens > planLimits.monthlyTokenLimit) {
          throw new Error(`Monthly token limit would be exceeded. Estimated tokens needed: ${sizeValidation.estimatedTokens}, Available: ${planLimits.monthlyTokenLimit - monthlyUsage}`);
        }
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: getLanguageSpecificPrompt(analysisLanguage),
        },
        {
          role: "user",
          content: `Please analyze this contract:\n\n${contractText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Track token usage
    if (userId && response.usage) {
      await storage.recordTokenUsage({
        userId,
        operation: 'contract_analysis',
        tokensUsed: response.usage.total_tokens,
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        model: 'gpt-4o',
        cost: calculateCost(response.usage.total_tokens, 'gpt-4o')
      });
    }

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: analysis.summary || "Unable to generate summary",
      riskAssessment: analysis.riskAssessment || { high: [], medium: [], low: [] },
      keyTerms: analysis.keyTerms || [],
      recommendations: analysis.recommendations || [],
    };
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze contract: " + (error as Error).message);
  }
}

// Calculate cost based on model and tokens
function calculateCost(tokens: number, model: string): number {
  // GPT-4o pricing: $2.50 per 1M input tokens, $10.00 per 1M output tokens
  // Simplified calculation - in production, you'd track input/output separately
  const costPerToken = 0.0000025; // Average cost per token
  return tokens * costPerToken;
}
