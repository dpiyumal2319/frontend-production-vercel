import React, {JSX} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {getScreenStocks} from "../_utils/actions";
import {ScreenerType} from "../_utils/definitions";
import RiskBadge from "@/app/(dashboard)/_components/RiskBadge";
import AddStockDialog from "./AddStockDialog";
import {formatMarketCap, formatPercent} from "../_utils/utils";
import RatingDisplay from "./RatingDisplay";
import Link from "next/link";
import {getCurrentUser} from "@/actions/auth";
import RiskWatchListBadge from "@/app/(dashboard)/_components/RiskWatchListBadge";

// Price change component
const PriceChange = ({change}: { change: number | null }): JSX.Element => {
    if (change === null) {
        return <span className="text-gray-500">N/A</span>;
    }

    const isPositive = change >= 0;
    return (
        <div className={isPositive ? "text-green-500" : "text-red-500"}>
            {formatPercent(change)}
        </div>
    );
};

// Main component type definition
interface ScreenTableProps {
    filter: ScreenerType;
    page: number;
    result_per_page?: number;
}

// Main component
const ScreenTable = async ({filter, page, result_per_page = 10}: ScreenTableProps): Promise<JSX.Element> => {
    const stocks = await getScreenStocks({result_per_page, filter, page});
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <div className="rounded-md border p-6 text-center text-muted-foreground">
                You must be logged in to view this content.
            </div>
        );
    }

    const isAdmin = currentUser.role === 'admin';

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className={'bg-primary/10'}>
                        <TableHead className="w-[100px]">Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className={'text-right'}>Analyst Rating</TableHead>
                        <TableHead className={'text-right'}>Risk</TableHead>
                        <TableHead className="text-right">Market Cap</TableHead>
                        {isAdmin && <TableHead className="w-[80px]"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stocks.success ? (
                        stocks.data.quotes.length > 0 ? (
                            stocks.data.quotes.map((stock) => (
                                <TableRow key={stock.symbol}>
                                    <TableCell className="font-bold text-primary">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/assets/${stock.symbol}`}
                                                  className="underline cursor-pointer">
                                                {stock.symbol}
                                            </Link>
                                            {!isAdmin && stock.in_db && (
                                                <RiskWatchListBadge/>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={stock.name}>
                                        {stock.name}
                                    </TableCell>
                                    <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <PriceChange change={stock.priceChangePercent}/>
                                    </TableCell>
                                    <TableCell className={'text-right'}>
                                        <RatingDisplay rating={stock.analystRating}/>
                                    </TableCell>
                                    <TableCell className={'flex justify-end'}>
                                        <RiskBadge score={stock.risk_score} showIcon={false} showValue={false}/>
                                    </TableCell>
                                    <TableCell className="text-right">{formatMarketCap(stock.marketCap)}</TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            <AddStockDialog stock={stock} in_db={stock.in_db ? stock.in_db : false}/>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-6 text-muted-foreground">
                                    No stocks match your criteria
                                </TableCell>
                            </TableRow>
                        )
                    ) : (
                        <TableRow>
                            <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-6 text-muted-foreground">
                                Error: {stocks.error}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export {ScreenTable};