'use server';

import AxiosInstance from '@/lib/server-fetcher';

export async function fetchStockPrediction({
                                               starting_date,
                                               ending_date,
                                               ticker_symbol,
                                           }: {
    starting_date: string;
    ending_date: string;
    ticker_symbol: string;
}) {
    const response = await AxiosInstance.post('/V2/get-predicted-prices', {
        starting_date,
        ending_date,
        ticker_symbol,
    });
    return response.data;
}