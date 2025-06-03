-- Create banking tables for Open Banking integration

-- Bank connections table
CREATE TABLE IF NOT EXISTS "kleero_bank_connections" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" VARCHAR(255) NOT NULL REFERENCES "kleero_user"("id") ON DELETE CASCADE,
  "provider_name" VARCHAR(50) NOT NULL,
  "provider_account_id" VARCHAR(255) NOT NULL,
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT,
  "consent_id" VARCHAR(255),
  "bank_id" VARCHAR(255),
  "status" VARCHAR(20) NOT NULL DEFAULT 'active',
  "expires_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank accounts table
CREATE TABLE IF NOT EXISTS "kleero_bank_accounts" (
  "id" VARCHAR(255) PRIMARY KEY,
  "connection_id" VARCHAR(255) NOT NULL REFERENCES "kleero_bank_connections"("id") ON DELETE CASCADE,
  "account_name" VARCHAR(255) NOT NULL,
  "account_type" VARCHAR(50),
  "account_number" VARCHAR(50),
  "balance" DECIMAL(10, 2),
  "currency" VARCHAR(3) NOT NULL,
  "last_updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank transactions table
CREATE TABLE IF NOT EXISTS "kleero_bank_transactions" (
  "id" VARCHAR(255) PRIMARY KEY,
  "account_id" VARCHAR(255) NOT NULL REFERENCES "kleero_bank_accounts"("id") ON DELETE CASCADE,
  "amount" DECIMAL(10, 2) NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "description" VARCHAR(255),
  "merchant_name" VARCHAR(255),
  "category" VARCHAR(100),
  "pending" BOOLEAN DEFAULT FALSE,
  "synced" BOOLEAN DEFAULT FALSE,
  "expense_id" INTEGER REFERENCES "kleero_expense"("id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "bank_connections_user_id_idx" ON "kleero_bank_connections"("user_id");
CREATE INDEX IF NOT EXISTS "bank_accounts_connection_id_idx" ON "kleero_bank_accounts"("connection_id");
CREATE INDEX IF NOT EXISTS "bank_transactions_account_id_idx" ON "kleero_bank_transactions"("account_id");
CREATE INDEX IF NOT EXISTS "bank_transactions_date_idx" ON "kleero_bank_transactions"("date");
CREATE INDEX IF NOT EXISTS "bank_transactions_expense_id_idx" ON "kleero_bank_transactions"("expense_id"); 