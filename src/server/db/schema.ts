import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `ledgerly_${name}`);

export const incomeCategories = pgTable("incomeCategory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type IncomeCategory = InferSelectModel<typeof incomeCategories>;

export const incomes = pgTable("income", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  amount: integer("amount").notNull(),
  incomeCategoryId: integer("incomeCategoryId").notNull(),
  isRecurring: boolean("isRecurring").notNull(),
  relatedDate: timestamp("relatedDate").notNull(),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type Income = InferSelectModel<typeof incomes>;

export const incomesRelations = relations(incomes, ({ one }) => ({
  incomeCategory: one(incomeCategories, {
    fields: [incomes.incomeCategoryId],
    references: [incomeCategories.id],
  }),
  user: one(users, { fields: [incomes.createdById], references: [users.id] }),
}));

export const expenseCategories = pgTable("expenseCategory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type ExpenseCategory = InferSelectModel<typeof expenseCategories>;

export const expenseSubCategories = pgTable("expenseSubCategory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  expenseCategoryId: integer("expenseCategoryId").notNull(),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type ExpenseSubCategory = InferSelectModel<typeof expenseSubCategories>;

export const expenseSubCategoriesRelations = relations(
  expenseSubCategories,
  ({ one }) => ({
    expenseCategory: one(expenseCategories, {
      fields: [expenseSubCategories.expenseCategoryId],
      references: [expenseCategories.id],
    }),
  }),
);

export const expenses = pgTable("expense", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  amount: integer("amount").notNull(),
  description: text("description"),
  expenseCategoryId: integer("expenseCategoryId").notNull(),
  expenseSubCategoryId: integer("expenseSubCategoryId").notNull(),
  isRecurring: boolean("isRecurring").notNull(),
  endDate: timestamp("endDate"),
  relatedSavingId: integer("relatedSavingId"),
  relatedDate: timestamp("relatedDate"),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type Expense = InferSelectModel<typeof expenses>;

export const expensesRelations = relations(expenses, ({ one }) => ({
  expenseCategory: one(expenseCategories, {
    fields: [expenses.expenseCategoryId],
    references: [expenseCategories.id],
  }),
  expenseSubCategory: one(expenseSubCategories, {
    fields: [expenses.expenseSubCategoryId],
    references: [expenseSubCategories.id],
  }),
  user: one(users, { fields: [expenses.createdById], references: [users.id] }),
  saving: one(savings, {
    fields: [expenses.relatedSavingId],
    references: [savings.id],
  }),
}));

export const savingsCategories = pgTable("savingsCategory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  iconFaName: varchar("iconFaName", { length: 255 }),
  requiresAmount: boolean("requiresAmount").notNull().default(false),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type SavingsCategory = InferSelectModel<typeof savingsCategories>;

export const savingsWithdrawals = pgTable("savingsWithdrawal", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  description: text("description"),
  savingId: integer("savingId").notNull(),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type SavingsWithdrawal = InferSelectModel<typeof savingsWithdrawals>;

export const savingsWithdrawalsRelations = relations(
  savingsWithdrawals,
  ({ one }) => ({
    saving: one(savings, {
      fields: [savingsWithdrawals.savingId],
      references: [savings.id],
    }),
    user: one(users, {
      fields: [savingsWithdrawals.createdById],
      references: [users.id],
    }),
  }),
);

export const savings = pgTable("saving", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  startingAmount: integer("startingAmount").default(0),
  finalAmount: integer("finalAmount").default(0),
  savingsCategoryId: integer("savingsCategoryId").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  depositedAmount: integer("depositedAmount").default(0),
  withdrawnAmount: integer("withdrawnAmount").default(0),
  endDate: timestamp("endDate"),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
});

export type Saving = InferSelectModel<typeof savings>;

export const savingsRelations = relations(savings, ({ one, many }) => ({
  savingsCategory: one(savingsCategories, {
    fields: [savings.savingsCategoryId],
    references: [savingsCategories.id],
  }),
  user: one(users, { fields: [savings.createdById], references: [users.id] }),
  expenses: many(expenses),
  savingWithdrawals: many(savingsWithdrawals),
}));

export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }),
  image: varchar("image", { length: 255 }),
});

export type User = InferSelectModel<typeof users>;

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("accounts_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("sessions_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
