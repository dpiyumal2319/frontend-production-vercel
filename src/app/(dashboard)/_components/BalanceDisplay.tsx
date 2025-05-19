// app/(dashboard)/_components/BalanceDisplay.tsx
'use client';

import {useBalance} from '@/context/BalanceContext';
import {CircleDollarSign} from 'lucide-react';

export default function BalanceDisplay() {
    const {balance, isLoading} = useBalance();

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-muted-foreground dark:bg-muted/50">
            <CircleDollarSign size={18} className="text-primary"/>
            {isLoading ? (
                <span className="text-sm font-medium text-muted-foreground animate-pulse">
                    Loading...
                </span>
            ) : (
                <span className="text-sm font-semibold text-foreground">
                    ${balance?.toFixed(2)}
                </span>
            )}
        </div>
    );
}
