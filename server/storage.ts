import {
  users,
  contracts,
  type User,
  type UpsertUser,
  type Contract,
  type InsertContract,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export const storage = new DatabaseStorage();
