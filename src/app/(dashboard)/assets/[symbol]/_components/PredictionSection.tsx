'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {Download, ExternalLink, Info} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Asset} from "@/app/(dashboard)/assets/[symbol]/_utils/definitions";
import {exportToCSV} from "@/lib/export";
import {PredictionData, StockData, ModelMetadataType} from "@/lib/types/stock_prediction";
import {fetchStockPrediction} from "@/app/(dashboard)/dashboard/stockmarketprediction/_actions/action";
import ModelMetadata from "@/app/(dashboard)/dashboard/stockmarketprediction/_components/model-metadata";
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";
import PredictionLoading from "@/app/(dashboard)/assets/[symbol]/_components/PredictionLoading";

interface PredictionSectionProps {
    ticker: string;
    inDb: boolean;
    asset: Asset;
    isAdmin: boolean;
}

const PredictionSection = ({ticker, asset, isAdmin, inDb}: PredictionSectionProps) => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [modelMetadata, setModelMetadata] = useState<ModelMetadataType | null>(null);
    const [isPredicting, setPredicting] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);
    const [sevChange, setSevChange] = useState<number | null>(null);

    // Calculate date range using useMemo to stabilize references
    const {fromDate, toDate, formatDate} = useMemo(() => {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 31);
        const to = new Date(today);
        to.setDate(today.getDate() - 1);

        const formatter = (date: Date) => {
            return date.toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
        };

        return {
            fromDate: from,
            toDate: to,
            formatDate: formatter
        };
    }, []);

    useEffect(() => {
        if (!inDb) return;

        const fetchData = async () => {
            setPredicting(true);
            setDataError(null);

            try {
                const data = await fetchStockPrediction({
                    starting_date: formatDate(fromDate),
                    ending_date: formatDate(toDate),
                    ticker_symbol: ticker,
                });

                setStockData(data.stockData);
                setModelMetadata(data.modelMetadata);
                setPredictionData(data.predictionData);

                if (
                    data.predictionData &&
                    data.stockData &&
                    data.stockData.history.length > 0 &&
                    data.predictionData.predictions.length > 0
                ) {
                    const lastPrediction = data.predictionData.predictions[data.predictionData.predictions.length - 1].predicted;
                    const lastPrice = data.stockData.history[data.stockData.history.length - 1].price;
                    const percentageChange = ((lastPrediction - lastPrice) / lastPrice) * 100;
                    setSevChange(percentageChange);
                }
            } catch (error) {
                console.error("Error fetching prediction data", error);
                setDataError("Failed to load prediction data. Please try again later.");
            } finally {
                setPredicting(false);
            }
        };

        fetchData().then();
    }, [ticker, inDb, fromDate, toDate, formatDate]);

    const handleExport = () => {
        if (predictionData) {
            exportToCSV(predictionData, `${ticker}_predictions`);
        }
    };

    // Check if model is in pending/training state
    if (inDb && asset.db?.status === 'Pending') {
        return <PredictionLoading/>;
    }

    if (!inDb) {
        return (
            <div className="mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-muted-foreground mb-4">Prediction data not available for this asset.</p>
                            {isAdmin && (
                                <Button variant="outline">Add to prediction database</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isPredicting) {
        return (
            <div className="mb-6">
                <Skeleton className="h-36 w-full mb-4"/>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <Skeleton className="h-48 w-full"/>
                    <Skeleton className="h-48 w-full"/>
                </div>
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-muted-foreground">{dataError}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Prediction Model</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                                Prediction model details for {ticker}
                            </span>
                            <Link href={'/dashboard/stockmarketprediction'} target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 inline-flex items-center gap-1 hover:underline text-sm">
                                More info
                                <ExternalLink size={12}
                                              className="shrink-0 text-blue-600 hover:text-blue-800"/>
                            </Link>
                        </div>
                    </div>
                    {predictionData && (
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4"/>
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Prediction Card */}
            {predictionData && stockData && (
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium">Predicted Price (7d)</CardTitle>
                            <CardDescription>ML model prediction</CardDescription>
                        </div>
                        <Badge variant={(sevChange ?? 0) > 0 ? "success" : "destructive"} className="ml-auto">
                            {(sevChange ?? 0) > 0 ? "+" : ""}
                            {(sevChange ?? 0).toFixed(2)}%
                        </Badge>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                        <Info className="h-4 w-4"/>
                                        <span className="sr-only">Model info</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Prediction based on {modelMetadata?.modelType} model</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${predictionData?.nextWeek.predicted.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Confidence: ${predictionData?.nextWeek.confidenceLow.toFixed(2)} -
                            ${predictionData?.nextWeek.confidenceHigh.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            )}
            {/* Model Details Section */}
            {modelMetadata && (
                <ModelMetadata metadata={modelMetadata}/>
            )}
        </div>
    );
};

export default PredictionSection;

