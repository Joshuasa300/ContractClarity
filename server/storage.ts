import {
  users,
  contracts,
  contractTemplates,
  clauseLibrary,
  usageLogs,
  planLimits,
  pendingRegistrations,
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
  type PendingRegistration,
  type InsertPendingRegistration,
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
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  updateUserProfile(userId: string, profileData: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  }): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;
  
  // Email verification operations
  generateVerificationToken(userId: string): Promise<{ token: string; code: string }>;
  verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }>;
  resendVerificationCode(userId: string): Promise<{ success: boolean; rateLimited?: boolean }>;
  markEmailAsVerified(userId: string): Promise<User>;
  isEmailVerified(userId: string): Promise<boolean>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  
  // Password reset operations
  generatePasswordResetToken(email: string): Promise<{ success: boolean; rateLimited?: boolean }>;
  validatePasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  
  // Pending registration operations
  createPendingRegistration(registration: {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    verificationCode: string;
  }): Promise<{ id: string; expiresAt: Date }>;
  getPendingRegistration(email: string): Promise<PendingRegistration | undefined>;
  getPendingRegistrationByCode(email: string, code: string): Promise<PendingRegistration | undefined>;
  completePendingRegistration(email: string, code: string): Promise<{ success: boolean; user?: User }>;
  deletePendingRegistration(email: string): Promise<void>;
  cleanupExpiredRegistrations(): Promise<void>;
  
  // Subscription operations
  updateUserSubscription(
    userId: string,
    subscriptionData: {
      accountStatus: string;
      stripeCustomerId?: string;
      subscriptionExpiresAt?: Date;
    },
    resetUsage?: boolean
  ): Promise<User>;
  
  resetMonthlyUsage(userId: string): Promise<void>;
  
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

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
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

  async deleteUser(userId: string): Promise<void> {
    console.log('🗑️ Starting user deletion process for:', userId);
    
    // Delete all user's contracts first (to maintain referential integrity)
    await db.delete(contracts).where(eq(contracts.userId, userId));
    console.log('✅ Deleted all contracts for user:', userId);
    
    // Delete all user's usage logs
    await db.delete(usageLogs).where(eq(usageLogs.userId, userId));
    console.log('✅ Deleted all usage logs for user:', userId);
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, userId));
    console.log('✅ User deletion completed for:', userId);
  }

  async updateUserProfile(userId: string, profileData: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
  }): Promise<User> {
    console.log('📝 Updating user profile for:', userId, profileData);
    
    const [user] = await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log('✅ Profile update completed for user:', userId);
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    console.log('🔄 Updating password for user:', userId);
    
    const [user] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log('✅ Password update completed for user:', userId);
    return user;
  }

  // Email verification operations
  async generateVerificationToken(userId: string): Promise<{ token: string; code: string }> {
    const { emailService } = await import('./services/emailService');
    
    const token = emailService.generateVerificationToken();
    const code = emailService.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    await db
      .update(users)
      .set({
        verificationToken: token,
        verificationTokenExpiresAt: expiresAt,
        verificationCodeSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log('✅ Generated verification token for user:', userId);
    return { token, code };
  }

  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gte(users.verificationTokenExpiresAt, new Date())
        )
      );

    if (!user) {
      console.log('❌ Invalid or expired verification token:', token);
      return { success: false };
    }

    // Mark email as verified and clear the verification token
    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        verificationCodeSentAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ Email verified successfully for user:', user.id);
    return { success: true, userId: user.id };
  }

  async resendVerificationCode(userId: string): Promise<{ success: boolean; rateLimited?: boolean }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false };
    }

    // Check rate limiting - 60 second cooldown
    if (user.verificationCodeSentAt) {
      const timeSinceLastSent = Date.now() - user.verificationCodeSentAt.getTime();
      const cooldownMs = 60 * 1000; // 60 seconds
      
      if (timeSinceLastSent < cooldownMs) {
        console.log('⏱️ Rate limited verification resend for user:', userId);
        return { success: false, rateLimited: true };
      }
    }

    // Generate new token and code
    const { token, code } = await this.generateVerificationToken(userId);
    
    // Send email
    const { emailService } = await import('./services/emailService');
    const emailSent = await emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName || '',
      verificationCode: code,
    });

    if (!emailSent) {
      console.log('❌ Failed to send verification email for user:', userId);
      return { success: false };
    }

    console.log('✅ Verification code resent for user:', userId);
    return { success: true };
  }

  async markEmailAsVerified(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        verificationCodeSentAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    console.log('✅ Email marked as verified for user:', userId);
    return user;
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.emailVerified || false;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gte(users.verificationTokenExpiresAt, new Date())
        )
      );
    return user;
  }

  // Password reset operations
  async generatePasswordResetToken(email: string): Promise<{ success: boolean; rateLimited?: boolean }> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log('❌ Password reset requested for non-existent email:', email);
      return { success: false };
    }

    // Only allow password resets for local auth users (not OAuth users)
    if (user.authProvider !== 'local' || !user.password) {
      console.log('❌ Password reset not allowed for OAuth user:', email);
      return { success: false };
    }

    // Check rate limiting - 60 second cooldown
    if (user.passwordResetRequestedAt) {
      const timeSinceLastRequest = Date.now() - user.passwordResetRequestedAt.getTime();
      const cooldownMs = 60 * 1000; // 60 seconds
      
      if (timeSinceLastRequest < cooldownMs) {
        console.log('⏱️ Rate limited password reset request for user:', email);
        return { success: false, rateLimited: true };
      }
    }

    // Generate secure 32-byte random token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const requestedAt = new Date();

    // Store the reset token
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt,
        passwordResetRequestedAt: requestedAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    const { emailService } = await import('./services/emailService');
    // Use Replit URL if available, otherwise fallback to localhost
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS}` 
      : process.env.FRONTEND_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    
    const emailSent = await emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName || '',
      resetUrl,
    });

    if (!emailSent) {
      console.log('❌ Failed to send password reset email for user:', email);
      return { success: false };
    }

    console.log('✅ Password reset token generated and email sent for user:', email);
    return { success: true };
  }

  async validatePasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const user = await this.getUserByPasswordResetToken(token);
    if (!user) {
      console.log('❌ Invalid or expired password reset token');
      return { valid: false };
    }

    console.log('✅ Valid password reset token for user:', user.id);
    return { valid: true, userId: user.id };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.getUserByPasswordResetToken(token);
    if (!user) {
      console.log('❌ Invalid or expired password reset token during reset');
      return { success: false, error: 'Invalid or expired reset token' };
    }

    // Only allow password resets for local auth users
    if (user.authProvider !== 'local') {
      console.log('❌ Password reset attempted for OAuth user:', user.id);
      return { success: false, error: 'Password reset not allowed for OAuth accounts' };
    }

    // Hash the new password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        passwordResetRequestedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log('✅ Password reset successfully for user:', user.id);
    return { success: true };
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gte(users.passwordResetTokenExpiresAt, new Date())
        )
      );
    return user;
  }

  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      accountStatus: string;
      stripeCustomerId?: string;
      subscriptionExpiresAt?: Date;
    },
    resetUsage?: boolean
  ): Promise<User> {
    // If this is an upgrade (moving from free/null to paid plan), reset usage
    if (resetUsage) {
      await this.resetMonthlyUsage(userId);
    }
    
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

  async resetMonthlyUsage(userId: string): Promise<void> {
    // Delete all usage logs for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    console.log('🔄 Resetting monthly usage for user:', userId, 'from date:', startOfMonth.toISOString());
    
    const result = await db
      .delete(usageLogs)
      .where(
        and(
          eq(usageLogs.userId, userId),
          gte(usageLogs.createdAt, startOfMonth)
        )
      );
    
    console.log('✅ Monthly usage reset completed for user:', userId);
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

    // If user has null status (payment failed), completely block access
    if (user.accountStatus === null || user.accountStatus === 'null') {
      return { allowed: false, limit: 0, current: 0 };
    }

    const planLimits = await this.getPlanLimits(user.accountStatus);
    if (!planLimits) {
      return { allowed: false, limit: 0, current: 0 };
    }

    // Check operation-specific limits
    if (planLimits.operationLimits && typeof planLimits.operationLimits === 'object') {
      const opLimits = planLimits.operationLimits as Record<string, number>;
      
      // Check for lifetime limits (free plan)
      const lifetimeOperation = `${operation}_lifetime`;
      if (lifetimeOperation in opLimits) {
        // For downgraded users who exceed lifetime limits, give them monthly allowance
        // This prevents permanent lockout when users downgrade from paid plans
        
        // For free users, use lifetime limits (no monthly reset for downgraded users)
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(usageLogs)
          .where(and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.operation, operation)
          ));

        const operationCount = Number(result[0]?.count) || 0;
        if (operationCount >= opLimits[lifetimeOperation]) {
          return { allowed: false, limit: opLimits[lifetimeOperation], current: operationCount };
        }
        
        return { allowed: true, limit: opLimits[lifetimeOperation], current: operationCount };
      }
      
      // Check for monthly limits (paid plans)
      if (operation in opLimits) {
        // Use monthly period for operation limits
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(usageLogs)
          .where(and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.operation, operation),
            gte(usageLogs.createdAt, startOfMonth)
          ));

        const operationCount = Number(result[0]?.count) || 0;
        if (operationCount >= opLimits[operation]) {
          return { allowed: false, limit: opLimits[operation], current: operationCount };
        }
        
        return { allowed: true, limit: opLimits[operation], current: operationCount };
      }
    }



    // Default allow for operations without specific limits
    return { allowed: true, limit: 0, current: 0 };
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

  // Pending registration methods
  async createPendingRegistration(registration: {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    verificationCode: string;
  }): Promise<{ id: string; expiresAt: Date }> {
    const id = `pending_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(pendingRegistrations).values({
      id,
      email: registration.email,
      firstName: registration.firstName || null,
      lastName: registration.lastName || null,
      password: registration.password,
      verificationCode: registration.verificationCode,
      expiresAt,
    });

    console.log('✅ Created pending registration:', registration.email);
    return { id, expiresAt };
  }

  async getPendingRegistration(email: string): Promise<PendingRegistration | undefined> {
    const results = await db
      .select()
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.email, email))
      .limit(1);

    return results[0];
  }

  async getPendingRegistrationByCode(email: string, code: string): Promise<PendingRegistration | undefined> {
    const results = await db
      .select()
      .from(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, email),
          eq(pendingRegistrations.verificationCode, code)
        )
      )
      .limit(1);

    return results[0];
  }

  async completePendingRegistration(email: string, code: string): Promise<{ success: boolean; user?: User }> {
    const pendingReg = await this.getPendingRegistrationByCode(email, code);
    
    if (!pendingReg) {
      return { success: false };
    }

    // Check if expired
    if (new Date() > pendingReg.expiresAt) {
      await this.deletePendingRegistration(email);
      return { success: false };
    }

    // Create the actual user account
    const user = await this.createUser({
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      email: pendingReg.email,
      firstName: pendingReg.firstName,
      lastName: pendingReg.lastName,
      password: pendingReg.password,
      authProvider: 'local',
      emailVerified: true, // Account is verified since they completed email verification
    });

    // Delete pending registration
    await this.deletePendingRegistration(email);

    console.log('✅ Completed pending registration and created user:', email);
    return { success: true, user };
  }

  async deletePendingRegistration(email: string): Promise<void> {
    await db
      .delete(pendingRegistrations)
      .where(eq(pendingRegistrations.email, email));
  }

  async cleanupExpiredRegistrations(): Promise<void> {
    const now = new Date();
    await db
      .delete(pendingRegistrations)
      .where(sql`${pendingRegistrations.expiresAt} < ${now}`);
  }
}

export const storage = new DatabaseStorage();
