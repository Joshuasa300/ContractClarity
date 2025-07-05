import {
  users,
  contracts,
  contractTemplates,
  clauseLibrary,
  type User,
  type UpsertUser,
  type Contract,
  type InsertContract,
  type ContractTemplate,
  type InsertContractTemplate,
  type ClauseLibraryItem,
  type InsertClauseLibraryItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<User>;
  
  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: number): Promise<Contract | undefined>;
  getUserContracts(userId: string): Promise<Contract[]>;
  updateContractAnalysis(
    id: number,
    analysis: {
      summary: string;
      riskAssessment: any;
      keyTerms: any;
      recommendations: any;
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

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values(contract)
      .returning();
    return newContract;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    return contract;
  }

  async getUserContracts(userId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));
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
    return updatedContract;
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
      .where(eq(contractTemplates.category, category))
      .where(eq(contractTemplates.isActive, true));
  }

  async createContractFromTemplate(
    templateId: number,
    userId: string,
    variables: Record<string, string>,
    fileName: string
  ): Promise<Contract> {
    console.log("Storage: Creating contract from template", { templateId, userId, fileName, variableCount: Object.keys(variables).length });
    
    const template = await this.getTemplate(templateId);
    if (!template) {
      console.error("Template not found:", templateId);
      throw new Error("Template not found");
    }

    console.log("Template found:", template.name, "Content length:", template.content.length);

    // Replace variables in template content
    let content = template.content;
    console.log("Variables to replace:", Object.keys(variables));
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const beforeCount = (content.match(regex) || []).length;
      content = content.replace(regex, value || '');
      const afterCount = (content.match(regex) || []).length;
      console.log(`Replaced ${beforeCount - afterCount} instances of {{${key}}} with "${value}"`);
    });

    // Check for unreplaced variables and warn
    const unreplacedMatches = content.match(/{{[\w_]+}}/g);
    if (unreplacedMatches) {
      console.warn(`Unreplaced variables in template ${templateId}:`, unreplacedMatches);
    }
    
    console.log("Final content length after replacement:", content.length);

    const contractData = {
      userId,
      fileName,
      fileContent: content,
      templateId,
      analysisComplete: false,
    };

    console.log("Inserting contract into database...");
    const [contract] = await db
      .insert(contracts)
      .values(contractData)
      .returning();
    
    console.log("Contract successfully created with ID:", contract.id);
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
      .where(eq(clauseLibrary.category, category))
      .where(eq(clauseLibrary.isActive, true));
  }

  async searchClauses(query: string): Promise<ClauseLibraryItem[]> {
    return await db.select().from(clauseLibrary)
      .where(
        or(
          ilike(clauseLibrary.title, `%${query}%`),
          ilike(clauseLibrary.description, `%${query}%`),
          ilike(clauseLibrary.content, `%${query}%`)
        )
      )
      .where(eq(clauseLibrary.isActive, true));
  }
}

export const storage = new DatabaseStorage();
