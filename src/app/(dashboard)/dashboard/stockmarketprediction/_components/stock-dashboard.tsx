"use client"

import {useState, useEffect} from "react"
import {Download, Info} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Button} from "@/components/ui/button"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {DateRangePicker} from "./date-range-picker"
import {Badge} from "@/components/ui/badge"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import StockHistoryChart from "./stock-history-chart"
import StockPredictionChart from "./stock-prediction-chart"
import StockDataTable from "./stock-data-table"
import ModelMetadata from "./model-metadata"
//import {getStockData, getPredictionData, getModelMetadata} from "@/lib/data"
import {exportToCSV} from "@/lib/export"
import {PredictionData, StockData, ModelMetadataType} from "@/lib/types/stock_prediction";
import AxiosInstance from "@/lib/client-fetcher";
import {AxiosError} from "axios";
import {fetchStockPrediction} from "@/app/(dashboard)/dashboard/stockmarketprediction/_actions/action";
// import { number } from "zod"

type companyType = {
    value: string
    label: string
}

interface DateRange {
    from: Date | null;
    to: Date | null;
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-CA"); // "YYYY-MM-DD" format
};


export default function StockDashboard() {
    const [selectedCompany, setSelectedCompany] = useState<string>("")
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(new Date().setDate(new Date().getDate() - 31)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
    })
    const [stockData, setStockData] = useState<StockData | null>(null)
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
    const [modelMetadata, setModelMetadata] = useState<ModelMetadataType | null>(null)
    const [activeTab, setActiveTab] = useState("overview")
    const [sevchange, setSevchange] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [isPredicting, setPredicting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataerror, setDataerror] = useState<string | null>(null);


    const [companies, setCompanies] = useState<companyType[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                const response = await AxiosInstance.get(`/get-active-symbols`);
                const data = response.data;
                setCompanies(data.symbols);
                setSelectedCompany(data.symbols[0].value);
            } catch {
                setError("Error fetching company symbols");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies().then();
    }, []);

    useEffect(() => {
        if (!dateRange.from || !dateRange.to || selectedCompany === "") return;

        // Fetch stock data based on selected company and date range
        const fetchStockData = async () => {
            setPredicting(true); // Show loading popup
            try {
                const data = await fetchStockPrediction({
                    starting_date: formatDate(dateRange.from ?? new Date()),
                    ending_date: formatDate(dateRange.to ?? new Date()),
                    ticker_symbol: selectedCompany,
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
                    setSevchange(percentageChange);
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response && error.response.data && error.response.data.detail) {
                        setDataerror(error.response.data.detail);
                    } else {
                        setDataerror("Resource not found");
                    }
                }
                console.error("Error fetching stock data", error);
            } finally {
                setPredicting(false); // Hide loading popup
            }
        };

        fetchStockData().then();

        // Fetch prediction data
        // const predictions = getPredictionData(selectedCompany, dateRange.to);
        // setPredictionData(predictions);

        // Fetch model metadata
        // const metadata = getModelMetadata(selectedCompany);
        // setModelMetadata(metadata);
    }, [selectedCompany, dateRange]);

    const handleExport = () => {
        exportToCSV(predictionData, `${selectedCompany}_predictions`)
    }
    if (error) {
        return (
            <div className="min-h-screen bg-background text-gray-100">

                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <p className="text-gray-300">{error}</p>
                </div>

            </div>
        )

    }
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-gray-100">

                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-300">Loading History...</p>
                </div>

            </div>
        )
    } else if (isPredicting) {
        return (
            <div className="min-h-screen bg-background text-gray-100">

                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-300">Predicting stock close prices...</p>
                </div>

            </div>
        )
    } else {
        return (
            <div className="container mx-auto py-6 px-4 md:px-6 relative">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock Prediction Dashboard</h1>
                        <p className="text-muted-foreground">View historical data and ML-powered predictions for stock
                            prices</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedCompany && (
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select company"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.value} value={company.value}>
                                            {company.label} ({company.value})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <DateRangePicker
                            date={dateRange}
                            setDate={(newRange: DateRange) => setDateRange(newRange)}
                        />
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4"/>
                            Export
                        </Button>
                    </div>
                </div>
                {dataerror && (<div className="min-h-screen bg-background text-gray-100">

                    <div className="flex flex-col items-center justify-center h-[70vh]">
                        <p className="text-gray-300">{dataerror}</p>
                    </div>

                </div>)}

                {!dataerror && (<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                                <CardDescription>Last trading day</CardDescription>
                            </div>
                            <Badge variant={(stockData?.priceChange ?? 0) > 0 ? "success" : "destructive"}
                                   className="ml-auto">
                                {(stockData?.priceChange ?? 0) > 0 ? "+" : ""}
                                {(stockData?.priceChange ?? 0).toFixed(2)}%
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stockData?.currentPrice.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">Predicted Price (7d)</CardTitle>
                                <CardDescription>ML model prediction</CardDescription>
                            </div>
                            <Badge variant={(sevchange ?? 0) > 0 ? "success" : "destructive"}
                                   className="ml-auto">
                                {(sevchange ?? 0) > 0 ? "+" : ""}
                                {(sevchange ?? 0).toFixed(2)}%
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
                                        {/* <p>Accuracy: {modelMetadata?.accuracy}%</p> */}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${predictionData?.nextWeek.predicted.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {predictionData?.nextWeek.confidenceLow.toFixed(2)} -{" "}
                                {predictionData?.nextWeek.confidenceHigh.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                </div>)}

                {!dataerror && (<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList className="grid w-full grid-cols-3 md:w-auto">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="predictions">Predictions</TabsTrigger>
                        <TabsTrigger value="model">Model Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historical Stock Data</CardTitle>
                                <CardDescription>{selectedCompany} stock price over the selected time
                                    period</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {stockData && <StockHistoryChart data={stockData.history}/>}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Trading Volume</CardTitle>
                                <CardDescription>Daily trading volume for {selectedCompany}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {stockData &&
                                    <StockHistoryChart data={stockData.history} dataKey="volume" chartType="bar"/>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="predictions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Price Predictions</CardTitle>
                                <CardDescription>ML-powered price predictions with confidence
                                    intervals</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {predictionData && stockData && (
                                    <StockPredictionChart
                                        historicalData={stockData.history.slice(-30)}
                                        predictionData={predictionData.predictions}
                                    />
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Prediction Data</CardTitle>
                                <CardDescription>Detailed prediction data for {selectedCompany}</CardDescription>
                            </CardHeader>
                            <CardContent>{predictionData &&
                                <StockDataTable data={predictionData.predictions}/>}</CardContent>
                            <CardFooter>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Export as CSV
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="model" className="space-y-6">
                        {modelMetadata && <ModelMetadata metadata={modelMetadata}/>}
                    </TabsContent>
                </Tabs>)}
            </div>
        )
    }
}
