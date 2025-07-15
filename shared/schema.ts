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
  real,
  decimal,
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
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For email/password auth, null for OAuth users
  authProvider: varchar("auth_provider").notNull().default("local"), // 'local', 'google', 'replit'
  googleId: varchar("google_id").unique(), // For Google OAuth
  replitId: varchar("replit_id").unique(), // For Replit Auth (legacy)
  // Email verification fields
  emailVerified: boolean("email_verified").default(false), // False for local auth users, true for OAuth users
  verificationToken: varchar("verification_token"), // Nullable token for email verification
  verificationTokenExpiresAt: timestamp("verification_token_expires_at"), // Token expiration
  verificationCodeSentAt: timestamp("verification_code_sent_at"), // Rate limiting for resends
  // Subscription fields
  accountStatus: varchar("account_status").default("free"), // 'free', 'plus', 'pro', 'premium', 'null' (payment failed)
  stripeCustomerId: varchar("stripe_customer_id").unique(), // Stripe customer ID
  subscriptionExpiresAt: timestamp("subscription_expires_at"), // Subscription expiration date
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
  detectedLanguage: varchar("detected_language").default("en"),
  analysisLanguage: varchar("analysis_language").default("en"),
  languageConfidence: real("language_confidence").default(0),
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

// Usage tracking table for OpenAI token consumption
export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  operation: varchar("operation").notNull(), // 'contract_analysis', 'translation', 'template_generation'
  tokensUsed: integer("tokens_used").notNull(),
  model: varchar("model").notNull(), // 'gpt-4o', 'gpt-4', etc.
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  cost: decimal("cost", { precision: 10, scale: 6 }), // Cost in USD
  contractId: integer("contract_id").references(() => contracts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Plan limits configuration table
export const planLimits = pgTable("plan_limits", {
  id: serial("id").primaryKey(),
  planType: varchar("plan_type").notNull().unique(), // 'free', 'plus', 'pro', 'premium'
  monthlyTokenLimit: integer("monthly_token_limit").notNull(),
  dailyTokenLimit: integer("daily_token_limit").notNull(),
  operationLimits: jsonb("operation_limits"), // Specific limits per operation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pending registrations table - stores registration data until email verification
export const pendingRegistrations = pgTable("pending_registrations", {
  id: varchar("id", { length: 100 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  password: varchar("password", { length: 255 }).notNull(),
  verificationCode: varchar("verification_code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  contracts: many(contracts),
  usageLogs: many(usageLogs),
}));

export const contractRelations = relations(contracts, ({ one, many }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  template: one(contractTemplates, {
    fields: [contracts.templateId],
    references: [contractTemplates.id],
  }),
  usageLogs: many(usageLogs),
}));

export const templateRelations = relations(contractTemplates, ({ many }) => ({
  contracts: many(contracts),
}));

export const usageLogRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
  contract: one(contracts, {
    fields: [usageLogs.contractId],
    references: [contracts.id],
  }),
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

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;

export type PlanLimit = typeof planLimits.$inferSelect;
export type InsertPlanLimit = typeof planLimits.$inferInsert;

export type PendingRegistration = typeof pendingRegistrations.$inferSelect;
export type InsertPendingRegistration = typeof pendingRegistrations.$inferInsert;

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // For select type
  required?: boolean;
  placeholder?: string;
}
