import {
  users,
  contracts,
  contractTemplates,
  clauseLibrary,
  usageLogs,
  planLimits,
  type User,
  type UpsertUser,
  type Contract,
  type InsertContract,
  type ContractTemplate,
  type InsertContractTemplate,
  type ClauseLibraryItem,
  type InsertClauseLibraryItem,
  type UsageLog,
  type InsertUsageLog,
  type PlanLimit,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and, gte, sum, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User>;
  
  // Subscription operations
  updateUserSubscription(
    userId: string,
    subscriptionData: {
      accountStatus: string;
      stripeCustomerId?: string;
      subscriptionExpiresAt?: Date;
    }
  ): Promise<User>;
  
  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: number): Promise<Contract | undefined>;
  getUserContracts(userId: string): Promise<Contract[]>;
  deleteContract(id: number): Promise<void>;
  updateContractAnalysis(
    id: number,
    analysis: {
      summary: string;
      riskAssessment: any;
      keyTerms: any;
      recommendations: any;
    }
  ): Promise<Contract>;

  updateContractLanguage(
    id: number,
    languageData: {
      detectedLanguage: string;
      analysisLanguage: string;
      languageConfidence: number;
    }
  ): Promise<Contract>;

  // Template operations
  getTemplates(): Promise<ContractTemplate[]>;
  getTemplate(id: number): Promise<ContractTemplate | undefined>;
  getTemplatesByCategory(category: string): Promise<ContractTemplate[]>;
  createContractFromTemplate(
    templateId: number,
    userId: string,
    variables: Record<string, string>,
    fileName: string
  ): Promise<Contract>;

  // Clause library operations
  getClauses(): Promise<ClauseLibraryItem[]>;
  getClause(id: number): Promise<ClauseLibraryItem | undefined>;
  getClausesByCategory(category: string): Promise<ClauseLibraryItem[]>;
  searchClauses(query: string): Promise<ClauseLibraryItem[]>;
  
  // Usage tracking operations
  recordTokenUsage(usage: InsertUsageLog): Promise<UsageLog>;
  getUserMonthlyUsage(userId: string): Promise<number>;
  getUserDailyUsage(userId: string): Promise<number>;
  checkUsageLimit(userId: string, operation: string): Promise<{ allowed: boolean; limit: number; current: number }>;
  getPlanLimits(planType: string): Promise<PlanLimit | undefined>;
  getUserUsageStats(userId: string): Promise<{
    monthly: number;
    daily: number;
    byOperation: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        googleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      accountStatus: string;
      stripeCustomerId?: string;
      subscriptionExpiresAt?: Date;
    }
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        accountStatus: subscriptionData.accountStatus,
        stripeCustomerId: subscriptionData.stripeCustomerId,
        subscriptionExpiresAt: subscriptionData.subscriptionExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values(contract)
      .returning();
    return {
      ...newContract,
      riskAssessment: newContract.riskAssessment as any,
      keyTerms: newContract.keyTerms as any,
      recommendations: newContract.recommendations as any,
    };
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    if (!contract) return undefined;
    return {
      ...contract,
      riskAssessment: contract.riskAssessment as any,
      keyTerms: contract.keyTerms as any,
      recommendations: contract.recommendations as any,
    };
  }

  async getUserContracts(userId: string): Promise<Contract[]> {
    const results = await db
      .select()
      .from(contracts)
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));
    return results.map(contract => ({
      ...contract,
      riskAssessment: contract.riskAssessment as any,
      keyTerms: contract.keyTerms as any,
      recommendations: contract.recommendations as any,
    }));
  }

  async deleteContract(id: number): Promise<void> {
    await db.delete(contracts).where(eq(contracts.id, id));
  }

  async updateContractAnalysis(
    id: number,
    analysis: {
      summary: string;
      riskAssessment: any;
      keyTerms: any;
      recommendations: any;
    }
  ): Promise<Contract> {
    const [updatedContract] = await db
      .update(contracts)
      .set({
        summary: analysis.summary,
        riskAssessment: analysis.riskAssessment,
        keyTerms: analysis.keyTerms,
        recommendations: analysis.recommendations,
        analysisComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    return {
      ...updatedContract,
      riskAssessment: updatedContract.riskAssessment as any,
      keyTerms: updatedContract.keyTerms as any,
      recommendations: updatedContract.recommendations as any,
    };
  }

  async updateContractLanguage(
    id: number,
    languageData: {
      detectedLanguage: string;
      analysisLanguage: string;
      languageConfidence: number;
    }
  ): Promise<Contract> {
    const [updatedContract] = await db
      .update(contracts)
      .set({
        detectedLanguage: languageData.detectedLanguage,
        analysisLanguage: languageData.analysisLanguage,
        languageConfidence: languageData.languageConfidence,
        updatedAt: new Date(),
      })
      .where(eq(contracts.id, id))
      .returning();
    return {
      ...updatedContract,
      riskAssessment: updatedContract.riskAssessment as any,
      keyTerms: updatedContract.keyTerms as any,
      recommendations: updatedContract.recommendations as any,
    };
  }

  // Template operations
  async getTemplates(): Promise<ContractTemplate[]> {
    return await db.select().from(contractTemplates).where(eq(contractTemplates.isActive, true));
  }

  async getTemplate(id: number): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template;
  }

  async getTemplatesByCategory(category: string): Promise<ContractTemplate[]> {
    return await db.select().from(contractTemplates)
      .where(and(
        eq(contractTemplates.category, category),
        eq(contractTemplates.isActive, true)
      ));
  }

  async createContractFromTemplate(
    templateId: number,
    userId: string,
    variables: Record<string, string>,
    fileName: string
  ): Promise<Contract> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Replace variables in template content
    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || '');
    });

    // Check for unreplaced variables and warn
    const unreplacedMatches = content.match(/{{[\w_]+}}/g);
    if (unreplacedMatches) {
      console.warn(`Unreplaced variables in template ${templateId}:`, unreplacedMatches);
    }

    const contractData = {
      userId,
      fileName,
      fileContent: content,
      templateId,
      analysisComplete: true, // Template contracts are ready to use immediately
      summary: `Contract generated from template: ${template.name}`,
    };

    const [contract] = await db
      .insert(contracts)
      .values(contractData)
      .returning();
    
    return contract as Contract;
  }

  // Clause library operations
  async getClauses(): Promise<ClauseLibraryItem[]> {
    return await db.select().from(clauseLibrary).where(eq(clauseLibrary.isActive, true));
  }

  async getClause(id: number): Promise<ClauseLibraryItem | undefined> {
    const [clause] = await db.select().from(clauseLibrary).where(eq(clauseLibrary.id, id));
    return clause;
  }

  async getClausesByCategory(category: string): Promise<ClauseLibraryItem[]> {
    return await db.select().from(clauseLibrary)
      .where(and(
        eq(clauseLibrary.category, category),
        eq(clauseLibrary.isActive, true)
      ));
  }

  async searchClauses(query: string): Promise<ClauseLibraryItem[]> {
    return await db.select().from(clauseLibrary)
      .where(and(
        or(
          ilike(clauseLibrary.title, `%${query}%`),
          ilike(clauseLibrary.description, `%${query}%`),
          ilike(clauseLibrary.content, `%${query}%`)
        ),
        eq(clauseLibrary.isActive, true)
      ));
  }

  // Usage tracking operations
  async recordTokenUsage(usage: InsertUsageLog): Promise<UsageLog> {
    const [newUsage] = await db
      .insert(usageLogs)
      .values(usage)
      .returning();
    return newUsage;
  }

  async getUserMonthlyUsage(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await db
      .select({ totalTokens: sum(usageLogs.tokensUsed) })
      .from(usageLogs)
      .where(and(
        eq(usageLogs.userId, userId),
        gte(usageLogs.createdAt, startOfMonth)
      ));

    return Number(result[0]?.totalTokens) || 0;
  }

  async getUserDailyUsage(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await db
      .select({ totalTokens: sum(usageLogs.tokensUsed) })
      .from(usageLogs)
      .where(and(
        eq(usageLogs.userId, userId),
        gte(usageLogs.createdAt, startOfDay)
      ));

    return Number(result[0]?.totalTokens) || 0;
  }

  async checkUsageLimit(userId: string, operation: string): Promise<{ allowed: boolean; limit: number; current: number }> {
    // Get user's plan
    const user = await this.getUser(userId);
    if (!user) {
      return { allowed: false, limit: 0, current: 0 };
    }

    const planLimits = await this.getPlanLimits(user.accountStatus);
    if (!planLimits) {
      return { allowed: false, limit: 0, current: 0 };
    }

    // Check daily limit
    const dailyUsage = await this.getUserDailyUsage(userId);
    if (dailyUsage >= planLimits.dailyTokenLimit) {
      return { allowed: false, limit: planLimits.dailyTokenLimit, current: dailyUsage };
    }

    // Check monthly limit
    const monthlyUsage = await this.getUserMonthlyUsage(userId);
    if (monthlyUsage >= planLimits.monthlyTokenLimit) {
      return { allowed: false, limit: planLimits.monthlyTokenLimit, current: monthlyUsage };
    }

    // Check operation-specific limits if available
    if (planLimits.operationLimits && typeof planLimits.operationLimits === 'object') {
      const opLimits = planLimits.operationLimits as Record<string, number>;
      if (operation in opLimits) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(usageLogs)
          .where(and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.operation, operation),
            gte(usageLogs.createdAt, startOfDay)
          ));

        const operationCount = Number(result[0]?.count) || 0;
        if (operationCount >= opLimits[operation]) {
          return { allowed: false, limit: opLimits[operation], current: operationCount };
        }
      }
    }

    return { allowed: true, limit: planLimits.dailyTokenLimit, current: dailyUsage };
  }

  async getPlanLimits(planType: string): Promise<PlanLimit | undefined> {
    const [plan] = await db
      .select()
      .from(planLimits)
      .where(and(
        eq(planLimits.planType, planType),
        eq(planLimits.isActive, true)
      ));
    return plan;
  }

  async getUserUsageStats(userId: string): Promise<{
    monthly: number;
    daily: number;
    byOperation: Record<string, number>;
  }> {
    const monthly = await this.getUserMonthlyUsage(userId);
    const daily = await this.getUserDailyUsage(userId);

    // Get usage by operation for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const operationUsage = await db
      .select({
        operation: usageLogs.operation,
        totalTokens: sum(usageLogs.tokensUsed)
      })
      .from(usageLogs)
      .where(and(
        eq(usageLogs.userId, userId),
        gte(usageLogs.createdAt, startOfMonth)
      ))
      .groupBy(usageLogs.operation);

    const byOperation: Record<string, number> = {};
    operationUsage.forEach(row => {
      byOperation[row.operation] = Number(row.totalTokens) || 0;
    });

    return { monthly, daily, byOperation };
  }
}

export const storage = new DatabaseStorage();
