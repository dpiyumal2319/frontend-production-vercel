import { TransactionSummary } from "@/lib/budget-lib/budget_api";

// Example calculation functions (adjust based on your specific metrics)
export function calculateSavingsScore(summary: TransactionSummary): number {
    // Calculate savings rate (saved vs income)
    if (summary.income === 0) return 0;
    const savingsRate = (summary.balance / summary.income) * 100;
    return Math.min(Math.round(savingsRate), 100);
}

export function calculateSpendingScore(summary: TransactionSummary): number {
    // Lower score if expenses are high compared to income
    if (summary.income === 0) return 0;
    const expenseRatio = (summary.expense / summary.income) * 100;
    return Math.max(0, 100 - Math.round(expenseRatio));
}

export function calculateBalanceTrendScore(summary: TransactionSummary): number {
    // Score based on whether balance is improving
    const trend = summary.balance - summary.previous_balance;
    if (trend > 0) return 80; // improving
    if (trend < 0) return 40; // declining
    return 60; // stable
}

export function calculateOverallScore(summary: TransactionSummary): number {
    // Weighted average of component scores
    return Math.round(
        (calculateSavingsScore(summary) * 0.4) +
        (calculateSpendingScore(summary) * 0.4) +
        (calculateBalanceTrendScore(summary) * 0.2)
    );
}