import React, {Suspense} from 'react';
import {getStocksCount} from "@/app/(dashboard)/assets/db/_utils/actions";
import {AssetsTable, AssetsTableSkeleton} from "@/app/(dashboard)/assets/db/_components/Assets";
import Pagination from "@/app/(dashboard)/global-assets/[type]/_components/Pagination";
import {getCurrentUser} from "@/actions/auth";
import RiskWatchListBadge from "@/app/(dashboard)/_components/RiskWatchListBadge";

// Make sure the searchParams has the correct type
const Page = async ({
                        searchParams,
                    }: {
    searchParams: Promise<{
        page?: string;
    }>;
}) => {
    // Example of excluding certain screener types if needed
    const page = parseInt((await searchParams).page as string) || 1;
    const count = await getStocksCount();
    const result_per_page = 10;
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
        <div className="flex flex-col px-5 py-4 items-center justify-center">
            <div className="flex items-center justify-start mb-5 w-full gap-2">
                <h1 className="text-2xl font-semibold">
                    {isAdmin ? "System Assets" : "Risk Watchlist"}
                </h1>
                {!isAdmin && (<RiskWatchListBadge/>)}
            </div>
            <div className="flex flex-col gap-4 w-full min-h-[500px]">
                <Suspense key={page} fallback={<AssetsTableSkeleton/>}>
                    <AssetsTable page={page} result_per_page={result_per_page}/>
                </Suspense>
                <Pagination page={page} itemsPerPage={result_per_page} totalItems={count ? count : undefined}/>
            </div>
        </div>
    );
};

export default Page;