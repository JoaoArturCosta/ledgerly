import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `ledgerly_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const incomeCategories = mysqlTable("incomeCategory", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export type IncomeCategory = InferSelectModel<typeof incomeCategories>;

export const incomes = mysqlTable("income", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  amount: int("amount").notNull(),
  incomeCategoryId: bigint("incomeCategoryId", { mode: "number" }).notNull(),
  isRecurring: boolean("isRecurring").notNull(),
  relatedDate: timestamp("relatedDate").notNull(),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export type Income = InferSelectModel<typeof incomes>;

export const incomesRelations = relations(incomes, ({ one }) => ({
  incomeCategory: one(incomeCategories, {
    fields: [incomes.incomeCategoryId],
    references: [incomeCategories.id],
  }),
  user: one(users, { fields: [incomes.createdById], references: [users.id] }),
}));

export const expenseCategories = mysqlTable("expenseCategory", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export type ExpenseCategory = InferSelectModel<typeof expenseCategories>;

export const expenseSubCategories = mysqlTable("expenseSubCategory", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  expenseCategoryId: bigint("expenseCategoryId", {
    mode: "number",
  }).notNull(),
  iconFaName: varchar("iconFaName", { length: 255 }),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
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

export const expenses = mysqlTable("expense", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  amount: int("amount").notNull(),
  description: text("description"),
  expenseCategoryId: bigint("expenseCategoryId", {
    mode: "number",
  }).notNull(),
  expenseSubCategoryId: bigint("expenseSubCategoryId", {
    mode: "number",
  }).notNull(),
  isRecurring: boolean("isRecurring").notNull(),
  relatedDate: timestamp("relatedDate"),
  createdById: varchar("createdById", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
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
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export type User = InferSelectModel<typeof users>;

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = mysqlTable(
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
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
