-- Update amount fields from integer to numeric(10,2) to support decimal values
-- This fixes the "invalid input syntax for type integer" error when users enter decimal amounts

-- Update income table
ALTER TABLE kleero_income ALTER COLUMN amount TYPE numeric(10,2);

-- Update expense table  
ALTER TABLE kleero_expense ALTER COLUMN amount TYPE numeric(10,2);

-- Update savings withdrawal table
ALTER TABLE kleero_savingsWithdrawal ALTER COLUMN amount TYPE numeric(10,2);

-- Update savings table amount fields
ALTER TABLE kleero_saving ALTER COLUMN startingAmount TYPE numeric(10,2);
ALTER TABLE kleero_saving ALTER COLUMN finalAmount TYPE numeric(10,2);
ALTER TABLE kleero_saving ALTER COLUMN depositedAmount TYPE numeric(10,2);
ALTER TABLE kleero_saving ALTER COLUMN withdrawnAmount TYPE numeric(10,2);

-- Update default values for savings table to use string format
ALTER TABLE kleero_saving ALTER COLUMN startingAmount SET DEFAULT '0';
ALTER TABLE kleero_saving ALTER COLUMN finalAmount SET DEFAULT '0';
ALTER TABLE kleero_saving ALTER COLUMN depositedAmount SET DEFAULT '0';
ALTER TABLE kleero_saving ALTER COLUMN withdrawnAmount SET DEFAULT '0'; 