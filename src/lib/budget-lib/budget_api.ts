'use server';

import AxiosInstance from '@/lib/server-fetcher';
import {revalidatePath} from 'next/cache';

// Types
export interface Transaction {
    id: number;
    user_id: string;
    amount: number;
    category: string;
    date: string;
    created_at: string;
    reason: string;
    type: string;
}

export interface BudgetGoal {
    id: number;
    user_id: string;
    title: string;
    category: string;
    amount: number;
    created_at: string;
    deadline: string;
}

export interface TransactionCreate {
    user_id: string;
    amount: number;
    category: string;
    reason: string;
    date: string;
    created_at: string;
    type: string;
}

export interface TransactionUpdate {
    amount?: number;
    category?: string;
    reason?: string;
    date?: string;
    created_at?: string;
    type?: string;
}

export interface BudgetGoalCreate {
    user_id: string;
    title: string;
    category: string;
    amount: number;
    created_at: string;
    deadline: string;
}

export interface BudgetGoalUpdate {
    title?: string;
    category?: string;
    amount?: number;
    created_at?: string;
    deadline?: string;
}

export interface TransactionSummary {
    income: number;
    expense: number;
    balance: number;
    previous_balance: number;
    previous_income: number;
    previous_expense: number;
    transactions: {
        date: string;
        balance: number;
    }[];
}

export interface PredictionResponse {
    predictions: {
        uid: string;
        today_income: number;
        today_expense: number;
        this_week_income: number;
        this_week_expense: number;
        this_month_income: number;
        this_month_expense: number;
        income_next_day: number;
        income_next_week: number;
        income_next_month: number;
        expense_next_day: number;
        expense_next_week: number;
        expense_next_month: number;
        income: Record<string, number>;
        expense: Record<string, number>;
    };
    financial_advice: {
        observations: string;
        daily_actions: string;
        weekly_actions: string;
        monthly_actions: string;
        risks: string;
        long_term_insights: string;
    };
    budget_goals: {
        time_period: string;
        amount: number;
        description: string;
    }[];
}

export interface BudgetReportResponse {
    transactions: Transaction[];
    budget_report: {
        summary: {
            total_income: number;
            total_expenses: number;
            net_savings: number;
            top_spending_categories: {
                category: string;
                percentage: number;
            }[];
        };
        assessment: string;
        recommendations: string[];
        alerts: string[];
    };
}

export interface BudgetReport {
    summary: {
        total_income: number;
        total_expenses: number;
        net_savings: number;
        top_spending_categories: {
            category: string;
            percentage: number;
        }[];
    };
    assessment: string;
    recommendations: string[];
    alerts: string[];
}

export interface CategorizeResponse {
    category: string;
    confidence: number;
}

export interface ChatResponse {
    response: string;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
}

// Server actions
export async function getPredictions(userId: string): Promise<PredictionResponse> {
    try {
        const response = await AxiosInstance.get(`/budget/predictions?user_id=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting predictions:', error);
        throw new Error('Failed to fetch predictions');
    }
}

export async function getBudgetReport(userId: string): Promise<BudgetReportResponse> {
    try {
        const response = await AxiosInstance.get(`/budget/budget-report?user_id=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting budget report:', error);
        throw new Error('Failed to fetch budget report');
    }
}

export async function categorizeTransaction(
    description: string,
    amount: number,
    type: string
): Promise<CategorizeResponse> {
    try {
        const response = await AxiosInstance.get(
            `/budget/categorize-transaction?description=${encodeURIComponent(
                description
            )}&amount=${amount}&type=${encodeURIComponent(type)}`
        );
        return response.data;
    } catch (error) {
        console.error('Error categorizing transaction:', error);
        throw new Error('Failed to categorize transaction');
    }
}

export async function chat(prompt: string): Promise<ChatResponse> {
    try {
        const response = await AxiosInstance.get(`/budget/chat?prompt=${encodeURIComponent(prompt)}`);
        return response.data;
    } catch (error) {
        console.error('Error chatting with LLM:', error);
        throw new Error('Failed to get chat response');
    }
}

export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
    try {
        const response = await AxiosInstance.get(`/budget/transactions/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

export async function createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    try {
        const response = await AxiosInstance.post('/budget/transactions', transaction);
        revalidatePath('/transactions'); // Adjust the path as needed
        return response.data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
    }
}

export async function updateTransaction(
    transactionId: number,
    updates: TransactionUpdate
): Promise<Transaction> {
    try {
        const response = await AxiosInstance.put(`/budget/transactions/${transactionId}`, updates);
        revalidatePath('/transactions'); // Adjust the path as needed
        return response.data;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
    }
}

export async function deleteTransaction(transactionId: number): Promise<void> {
    try {
        await AxiosInstance.delete(`/budget/transactions/${transactionId}`);
        revalidatePath('/transactions'); // Adjust the path as needed
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
    }
}

export async function getTransactionsByCategory(userId: string): Promise<CategoryBreakdown[][]> {
    try {
        const response = await AxiosInstance.get(`/budget/transactions/categories/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting transactions by category:', error);
        throw new Error('Failed to fetch transactions by category');
    }
}

export async function getTransactionSummary(userId: string): Promise<TransactionSummary> {
    try {
        const response = await AxiosInstance.get(`/budget/transactions/summary/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting transaction summary:', error);
        throw new Error('Failed to fetch transaction summary');
    }
}

export async function getBudgetGoals(userId: string): Promise<BudgetGoal[]> {
    try {
        const response = await AxiosInstance.get(`/budget/budget-goals/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting budget goals:', error);
        throw new Error('Failed to fetch budget goals');
    }
}

export async function createBudgetGoal(goal: BudgetGoalCreate): Promise<BudgetGoal> {
    try {
        const response = await AxiosInstance.post('/budget/budget-goals', goal);
        revalidatePath('/budget-goals'); // Adjust the path as needed
        return response.data;
    } catch (error) {
        console.error('Error creating budget goal:', error);
        throw new Error('Failed to create budget goal');
    }
}

export async function updateBudgetGoal(
    goalId: number,
    updates: BudgetGoalUpdate
): Promise<BudgetGoal> {
    try {
        const response = await AxiosInstance.put(`/budget/budget-goals/${goalId}`, updates);
        revalidatePath('/budget-goals'); // Adjust the path as needed
        return response.data;
    } catch (error) {
        console.error('Error updating budget goal:', error);
        throw new Error('Failed to update budget goal');
    }
}

export async function deleteBudgetGoal(goalId: number): Promise<void> {
    try {
        await AxiosInstance.delete(`/budget/budget-goals/${goalId}`);
        revalidatePath('/budget-goals'); // Adjust the path as needed
    } catch (error) {
        console.error('Error deleting budget goal:', error);
        throw new Error('Failed to delete budget goal');
    }
}