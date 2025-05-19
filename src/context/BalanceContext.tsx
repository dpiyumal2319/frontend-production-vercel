'use client';
import React, {createContext, useContext} from 'react';
import useSWR from 'swr';
import AxiosInstance from '@/lib/client-fetcher';
import {getCurrentUser} from "@/actions/auth";
import {budgetData} from "@/app/(dashboard)/dashboard/portfolio/_components/port-opt-form";
import {TransactionSummary} from "@/lib/budget-lib/budget_api";

const fetcher = async (): Promise<budgetData> => {
    const currentUser = await getCurrentUser();
    const res = await AxiosInstance.get<TransactionSummary>(`/budget/transactions/summary/${currentUser?.user_id}`);
    return res.data;
};

const BalanceContext = createContext<{
    data: budgetData | null;
    isLoading: boolean;
    refetch: () => void;
} | null>(null);

export const BalanceProvider = ({children}: { children: React.ReactNode }) => {
    const {data, error, mutate} = useSWR('/balance', fetcher);

    return (
        <BalanceContext.Provider
            value={{
                data: data ?? null,
                isLoading: !error && !data,
                refetch: () => mutate(),
            }}
        >
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) throw new Error('useBalance must be used within a BalanceProvider');
    return context;
};
