import React, {JSX} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {fetchStocks} from "@/app/(dashboard)/assets/db/_utils/actions";
import RiskBadge from "@/app/(dashboard)/_components/RiskBadge";
import StatusBadge, {UserStatusBadge} from "@/app/(dashboard)/_components/StatusBadge";
import {ArrowUpDown} from "lucide-react";
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";
import {formatDistanceToNow} from 'date-fns';
import {getCurrentUser} from "@/actions/auth";

// Main component type definition
interface ScreenTableProps {
    page: number;
    result_per_page?: number;
}

// Main component
const AssetsTable = async ({page, result_per_page = 10}: ScreenTableProps): Promise<JSX.Element> => {
    const offset = (page - 1) * result_per_page;
    const stocks = await fetchStocks({offset, limit: result_per_page});
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
                You must be logged in to view this content.
            </div>
        );
    }

    const sortedStocks = [...stocks].sort((a, b) => {
        const dateA = new Date(a.updated_at || 0);
        const dateB = new Date(b.updated_at || 0);
        return dateB.getTime() - dateA.getTime();
    });

    const isAdmin = currentUser.role === 'admin';

    return (
        <div className="rounded-md border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/10">
                        <TableHead className="font-medium text-xs">ID</TableHead>
                        <TableHead className="font-medium text-xs py-4">Ticker</TableHead>
                        <TableHead className="font-medium text-xs py-4">Name</TableHead>
                        <TableHead className="font-medium text-xs py-4">Status</TableHead>
                        <TableHead className="font-medium text-xs py-4">Exchange</TableHead>
                        <TableHead className="font-medium text-xs py-4">Sector</TableHead>
                        <TableHead className="font-medium text-xs py-4">Industry</TableHead>
                        <TableHead className="font-medium text-xs py-4">Type</TableHead>
                        <TableHead className="font-medium text-xs py-4">Risk</TableHead>
                        <TableHead className="font-medium text-xs text-right py-4">
                            <div className="flex items-center space-x-1">
                                <span>Last Updated</span>
                                <ArrowUpDown className="w-3 h-3"/>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedStocks.map((stock) => (
                        <TableRow
                            key={stock.stock_id}
                            className="transition-colors"
                        >
                            <TableCell
                                className="font-medium text-xs text-muted-foreground py-3">{stock.stock_id}</TableCell>
                            <TableCell className="text-primary font-medium py-3">
                                <Link href={`/assets/${stock.ticker_symbol}`}
                                      className="underline cursor-pointer">
                                    {stock.ticker_symbol}
                                </Link>
                            </TableCell>
                            <TableCell className="max-w-[10rem] truncate py-3">{stock.asset_name || '-'}</TableCell>
                            <TableCell className="py-3">
                                {isAdmin ? <StatusBadge status={stock.status}/> :
                                    <UserStatusBadge status={stock.status} showLabel={false}/>}
                            </TableCell>
                            <TableCell className="text-xs py-3">{stock.exchange || '-'}</TableCell>
                            <TableCell className="text-xs py-3">{stock.sectorDisp || '-'}</TableCell>
                            <TableCell
                                className="text-xs max-w-[10rem] truncate py-3">{stock.industryDisp || '-'}</TableCell>
                            <TableCell className="text-xs py-3">{stock.type || '-'}</TableCell>
                            <TableCell className="py-3">
                                <RiskBadge score={stock.risk_score ? parseFloat(stock.risk_score) : null}
                                           showValue={false}/>
                            </TableCell>
                            <TableCell className="text-xs text-right text-muted-foreground py-3">
                                {stock.updated_at
                                    ? formatDistanceToNow(new Date(stock.updated_at), {addSuffix: true})
                                    : '-'}
                            </TableCell>
                        </TableRow>
                    ))}

                    {stocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                                No stocks found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

const AssetsTableSkeleton = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className={'bg-primary/10'}>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Exchange</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({length: 8}).map((_, index) => (
                        <TableRow key={index} className={'h-[30px]'}>
                            {Array.from({length: 10}).map((_, cellIndex) => (
                                <TableCell key={cellIndex} className="text-center">
                                    <Skeleton className="h-5 w-full"/>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export {AssetsTable, AssetsTableSkeleton};