// context/BalanceContext.tsx
'use client';
import React, {createContext, useContext} from 'react';
import useSWR from 'swr';
import AxiosInstance from '@/lib/client-fetcher';
import {getCurrentUser} from "@/actions/auth";
import {budgetData} from "@/app/(dashboard)/dashboard/portfolio/_components/port-opt-form"; // your interceptor-based Axios instance

const fetcher = async () => {
    const currentUser = await getCurrentUser()

    const res = await AxiosInstance.get<budgetData>(`/budget/transactions/summary/${currentUser?.user_id}`);
    return res.data;
};

const BalanceContext = createContext<{
    balance: number | null;
    isLoading: boolean;
    refetch: () => void;
} | null>(null);

export const BalanceProvider = ({children}: { children: React.ReactNode }) => {
    const {data, error, mutate} = useSWR('/balance', fetcher);

    return (
        <BalanceContext.Provider
            value={{
                balance: data?.balance ?? null,
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
