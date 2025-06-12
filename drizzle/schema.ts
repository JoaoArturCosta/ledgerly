import { pgTable, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const kleeroExpenseCategoryIdSeq = pgSequence("kleero_expenseCategory_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroExpenseSubCategoryIdSeq = pgSequence("kleero_expenseSubCategory_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroExpenseIdSeq = pgSequence("kleero_expense_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroIncomeCategoryIdSeq = pgSequence("kleero_incomeCategory_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroIncomeIdSeq = pgSequence("kleero_income_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroSavingIdSeq = pgSequence("kleero_saving_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroSavingsCategoryIdSeq = pgSequence("kleero_savingsCategory_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const kleeroSavingsWithdrawalIdSeq = pgSequence("kleero_savingsWithdrawal_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })


