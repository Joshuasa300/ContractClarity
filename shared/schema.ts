import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts table for storing uploaded contracts and analysis results
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  fileName: varchar("file_name").notNull(),
  fileContent: text("file_content").notNull(),
  summary: text("summary"),
  riskAssessment: jsonb("risk_assessment"),
  keyTerms: jsonb("key_terms"),
  recommendations: jsonb("recommendations"),
  analysisComplete: boolean("analysis_complete").default(false),
  templateId: integer("template_id").references(() => contractTemplates.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables"), // Array of variable placeholders like [{name: "party1", label: "First Party Name", type: "text"}]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clauseLibrary = pgTable("clause_library", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  riskLevel: varchar("risk_level"), // "low", "medium", "high"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  contracts: many(contracts),
}));

export const contractRelations = relations(contracts, ({ one }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
}));

export const templateRelations = relations(contractTemplates, ({ many }) => ({
  contracts: many(contracts),
}));

// Schemas
export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for analysis results
export interface RiskItem {
  title: string;
  description: string;
}

export interface RiskAssessment {
  low: RiskItem[];
  medium: RiskItem[];
  high: RiskItem[];
}

export interface KeyTerm {
  title: string;
  category: string;
  riskLevel: string;
  description: string;
}

export interface Recommendation {
  action: string;
  priority: string;
}

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Contract = typeof contracts.$inferSelect & {
  riskAssessment?: RiskAssessment;
  keyTerms?: KeyTerm[];
  recommendations?: Recommendation[];
};
export type InsertContract = z.infer<typeof insertContractSchema>;

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = typeof contractTemplates.$inferInsert;

export type ClauseLibraryItem = typeof clauseLibrary.$inferSelect;
export type InsertClauseLibraryItem = typeof clauseLibrary.$inferInsert;

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // For select type
  required?: boolean;
  placeholder?: string;
}
