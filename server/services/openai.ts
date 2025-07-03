import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeContract(contractText: string): Promise<{
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal contract analysis expert. Analyze the provided contract and provide a comprehensive analysis in JSON format with the following structure:

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
5. Key financial, legal, and operational terms`,
        },
        {
          role: "user",
          content: `Please analyze this contract:\n\n${contractText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

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
