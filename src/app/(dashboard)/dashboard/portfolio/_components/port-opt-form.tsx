"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  X,
  Sparkles,
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useActionState } from "react";
import { optimizePortfolio } from "@/actions/profile";
import { BackendResultsWithSuccessAndMessage } from "@/lib/types/profile";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAPI } from "@/hooks/useAPI";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/actions/auth";
import { User } from "@/lib/types/user";
import AxiosInstance from "@/lib/client-fetcher";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

//interfaces
interface Ticker {
  ticker_symbol: string;
  asset_name: string;
  sectorDisp: string;
  currency: string;
  status: "Active" | "Pending" | "Warning";
}

interface TickerResponse {
  tickers: Ticker[];
}

export interface budgetData {
  income: number;
  expense: number;
  balance: number;
  previous_income: number;
  previous_expense: number;
  previous_balance: number;
  transactions: {
    date: string;
    balance: number;
  }[];
}

interface RiskScoreOut {
  score: number;
}

const STATUS_COLORS = {
  Active: "text-green-500",
  Pending: "text-amber-500",
  Warning: "text-red-500",
} as const;

const STATUS_DESCRIPTIONS = {
  Active: "Stock is actively trading and data is up to date",
  Pending: "Stock data is being updated",
  Warning: "Stock may have limited or outdated data",
} as const;

const initialState: BackendResultsWithSuccessAndMessage = {
  success: false,
  message: "",
  data: undefined,
};

const LoadingSelect = () => (
  <div className="space-y-2">
    <Skeleton className="h-10 w-full" />
  </div>
);

export default function PortfolioOptimizationPage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [issLoading, setissLoading] = useState(false);

  const [state, formAction, pending] = useActionState(
    optimizePortfolio,
    initialState
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [years, setYears] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [balanceWarning, setBalanceWarning] = useState(false);
  // New states
  const [optimizationMethod, setOptimizationMethod] = useState("max_sharpe");
  const [riskScorePercent, setRiskScorePercent] = useState<number | null>(null);
  const [exceedsBalance, setExceedsBalance] = useState(false);
  const [isRiskLoading, setIsRiskLoading] = useState(true);

  //fetching tickers
  const {
    data: tickerData,
    error,
    isLoading,
  } = useAPI<TickerResponse>("/profile/get_portfolio");

  //Getting current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUserError(
          error instanceof Error ? error.message : "Failed to fetch user"
        );
      }
    };

    fetchUser();
  }, []);

  //fetching users budget related data
  const { data: userData, error: userDataError } = useAPI<budgetData>(
    `/budget/transactions/summary/${user?.user_id}`
  );

  useEffect(() => {
    if (!user) return;
    setIsRiskLoading(true);
    AxiosInstance.get<RiskScoreOut>("/profile/risk_score", {
      params: { user_id: user.user_id },
    })
      .then((res) => {
        // 204 comes back with no body, so res.data === undefined
        setRiskScorePercent(res.status === 204 ? null : res.data.score);
      })
      .catch((err) => {
        console.error("could not load risk score", err);
      })
      .finally(() => {
        setIsRiskLoading(false);
      });
  }, [user]);

  //related to quiz
  useEffect(() => {
    // 1) Step & quiz score
    const stepParam = searchParams.get("step");
    if (stepParam) setCurrentStep(parseInt(stepParam, 10));

    const quizScore = searchParams.get("risk_score_percent");
    if (quizScore) {
      setOptimizationMethod("custom_risk");
    }

    // 2) Restore form fields
    const tickersParam = searchParams.get("tickers");
    if (tickersParam) {
      setSelectedTickers(JSON.parse(decodeURIComponent(tickersParam)));
    }
    const yearsParam = searchParams.get("years");
    if (yearsParam) setYears(yearsParam);

    const invParam = searchParams.get("inv");
    if (invParam) setInvestmentAmount(invParam);

    const tgtParam = searchParams.get("tgt");
    if (tgtParam) setTargetAmount(tgtParam);
  }, [searchParams]);

  //If form submission is successful direct to results page with the results got from the server action encoded in the URL
  useEffect(() => {
    if (state.success && state.data) {
      const encodedData = encodeURIComponent(JSON.stringify(state.data));
      router.push(`/dashboard/portfolio/results?data=${encodedData}`);
    }
  }, [state.success, state.data, router]);

  //handlers
  const handleTickerSelect = (ticker: string) => {
    setSelectedTickers((prev) => {
      if (prev.length < 5) {
        return [...prev, ticker];
      } else {
        // Replace the oldest ticker with the new one
        return [...prev.slice(1), ticker];
      }
    });
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    setSelectedTickers(
      selectedTickers.filter((ticker) => ticker !== tickerToRemove)
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedTickers.length < 2) return;
    if (currentStep === 2 && !years) return;
    if (currentStep === 3 && (!investmentAmount || !targetAmount)) return;
    if (currentStep === 3 && exceedsBalance) return;

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleInvestmentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    setInvestmentAmount(e.target.value);

    if (userData?.balance) {
      setBalanceWarning(value === userData.balance);
      setExceedsBalance(value > userData.balance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields before submitting
    if (
      selectedTickers.length < 2 ||
      !years ||
      !investmentAmount ||
      !targetAmount ||
      exceedsBalance ||
      (optimizationMethod === "custom_risk" && !riskScorePercent)
    ) {
      return;
    }

    // If validation passes, call the form action
    const formData = new FormData();
    formData.append("tickers", JSON.stringify(selectedTickers));
    formData.append("years", years);
    formData.append("investmentAmount", investmentAmount);
    formData.append("targetAmount", targetAmount);
    formData.append(
      "use_risk_score",
      optimizationMethod === "custom_risk" ? "true" : "false"
    );
    if (riskScorePercent) {
      formData.append("risk_score_percent", riskScorePercent.toString());
    }
    formAction(formData);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to Load Tickers</AlertTitle>
        <AlertDescription>
          We couldn&apos;t fetch your stock data. Please check your connection
          or try again later.
        </AlertDescription>
      </Alert>
    );
  }
  if (userError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>User Data Error</AlertTitle>
        <AlertDescription>
          Something went wrong while fetching your account. Try reloading the
          page.
        </AlertDescription>
      </Alert>
    );
  }
  if (userDataError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Budget Data Error</AlertTitle>
        <AlertDescription>
          Could not retrieve Excess Budget. Please check your account settings
          or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const handleClick = async () => {
    setissLoading(true);
    const qs = new URLSearchParams({
      tickers: JSON.stringify(selectedTickers),
      years,
      inv: investmentAmount,
      tgt: targetAmount,
    }).toString();
    router.push(`/dashboard/portfolio/quiz?${qs}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard/portfolio"
              className="text-foreground font-medium"
            >
              Portfolio Optimization
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Investment Portfolio Optimizer</CardTitle>
          </div>
          <CardDescription className="text-base space-y-2">
            <p>
              Create your optimal investment portfolio by selecting stocks and
              defining your investment goals.
            </p>
            <div className="flex flex-col gap-2 text-sm bg-muted/50 p-3 rounded-lg">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Our algorithm will help you find the best portfolio allocation
                based on historical data and modern portfolio theory.
              </p>
              <div className="flex flex-col gap-1 mt-2">
                <p className="font-medium">Stock Status Indicators:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      STATUS_COLORS.Active
                    )}
                  >
                    ● Active: {STATUS_DESCRIPTIONS.Active}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      STATUS_COLORS.Pending
                    )}
                  >
                    ● Pending: {STATUS_DESCRIPTIONS.Pending}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      STATUS_COLORS.Warning
                    )}
                  >
                    ● Warning: {STATUS_DESCRIPTIONS.Warning}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm mt-4">
              <span>Step {currentStep} of 4</span>
              <span>
                {currentStep === 1
                  ? "Select Stocks"
                  : currentStep === 2
                  ? "Investment Period"
                  : currentStep === 3
                  ? "Investment Details"
                  : "Optimization Method"}
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden inputs to carry React state into the form */}
            {/* <input
              type="hidden"
              name="tickers"
              value={JSON.stringify(selectedTickers)}
            />
            <input type="hidden" name="years" value={years} />
            <input
              type="hidden"
              name="investmentAmount"
              value={investmentAmount}
            />
            <input type="hidden" name="targetAmount" value={targetAmount} />
            <input
              type="hidden"
              name="use_risk_score"
              value={optimizationMethod === "custom_risk" ? "true" : "false"}
            />
            {optimizationMethod === "custom_risk" &&
              riskScorePercent != null && (
                <input
                  type="hidden"
                  name="risk_score_percent"
                  value={riskScorePercent.toString()}
                />
              )} */}

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="tickers"
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Select Stocks
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select at least 2 stocks for diversification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Suspense fallback={<LoadingSelect />}>
                    {isLoading ? (
                      <LoadingSelect />
                    ) : (
                      <Select
                        onValueChange={(value) => handleTickerSelect(value)}
                      >
                        <SelectTrigger className="bg-background">
                          <span className="text-muted-foreground text-sm">
                            {selectedTickers.length < 5
                              ? `Choose up to 5 stocks (${selectedTickers.length}/5 selected)`
                              : "Maximum of 5 stocks selected"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {tickerData?.tickers
                            .filter(
                              (ticker) =>
                                !selectedTickers.includes(ticker.ticker_symbol)
                            )
                            .map((ticker) => (
                              <SelectItem
                                key={ticker.ticker_symbol}
                                value={ticker.ticker_symbol}
                                className="flex flex-col items-start py-2"
                              >
                                <div className="font-medium flex items-center gap-2">
                                  {ticker.ticker_symbol} - {ticker.asset_name}
                                  <span
                                    className={cn(
                                      "text-xs",
                                      STATUS_COLORS[ticker.status]
                                    )}
                                  >
                                    ● {ticker.status}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {ticker.sectorDisp} | {ticker.currency}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Suspense>

                  <AnimatePresence>
                    {selectedTickers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-wrap gap-2 mt-2"
                      >
                        {selectedTickers.map((ticker) => {
                          const tickerInfo = tickerData?.tickers.find(
                            (t) => t.ticker_symbol === ticker
                          );
                          return (
                            <motion.div
                              key={ticker}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="bg-secondary px-3 py-1.5 rounded-lg text-sm w-full"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {tickerInfo?.ticker_symbol} -{" "}
                                    {tickerInfo?.asset_name}
                                    {tickerInfo && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger type="button">
                                            <span
                                              className={cn(
                                                "text-xs",
                                                STATUS_COLORS[tickerInfo.status]
                                              )}
                                            >
                                              ● {tickerInfo.status}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {
                                                STATUS_DESCRIPTIONS[
                                                  tickerInfo.status
                                                ]
                                              }
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {tickerInfo?.sectorDisp} |{" "}
                                    {tickerInfo?.currency}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTicker(ticker)}
                                  className="hover:text-destructive transition-colors ml-2"
                                  aria-label={`Remove ${ticker}`}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="years" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Investment Period
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter your planned investment duration in years</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="years"
                    name="year_s"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    className="bg-background"
                    placeholder="e.g., 5 years"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="investmentAmount"
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Initial Investment
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The amount you plan to invest initially</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <>
                      <Input
                        id="investmentAmount"
                        name="investmentAmount"
                        type="number"
                        min="0"
                        max={userData?.balance || 0}
                        step="0.01"
                        required
                        className={cn(
                          "bg-background",
                          balanceWarning && "border-amber-500",
                          exceedsBalance && "border-destructive"
                        )}
                        placeholder="e.g., 10000"
                        value={investmentAmount}
                        onChange={handleInvestmentAmountChange}
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        Available Balance: $
                        {userData?.balance?.toFixed(2) || "0.00"}
                      </div>
                      {balanceWarning && (
                        <div className="text-sm text-amber-500 mt-1">
                          Warning: You are about to invest your entire available
                          balance
                        </div>
                      )}
                      {exceedsBalance && (
                        <div className="text-sm text-destructive mt-1">
                          Error: Amount exceeds your available balance
                        </div>
                      )}
                    </>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="targetAmount"
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Target Amount
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Your desired portfolio value at the end of the
                              investment period
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="bg-background"
                      placeholder="e.g., 15000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="years" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Optimization Method
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select your prefered optimizarion method</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <Select
                    value={optimizationMethod}
                    onValueChange={setOptimizationMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="max_sharpe">
                        Max Sharpe Ratio
                      </SelectItem>
                      <SelectItem value="custom_risk">
                        Custom Risk Level (Quiz)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {optimizationMethod === "custom_risk" && (
                    <div className="space-y-2">
                      <p>
                        Your risk score:{" "}
                        {isRiskLoading
                          ? "Loading…"
                          : riskScorePercent === null
                          ? "No risk level. Please take the quiz."
                          : `${riskScorePercent}%`}
                      </p>

                      {/* Always show a single button whose text toggles */}
                      <Button
                        type="button"
                        onClick={handleClick}
                        disabled={issLoading}
                        className="inline-flex items-center justify-center gap-2 w-32"
                      >
                        {issLoading ? (
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            aria-label="Loading…"
                          />
                        ) : riskScorePercent != null ? (
                          "Retake Quiz"
                        ) : (
                          "Take Quiz"
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {selectedTickers.length === 0 && currentStep === 1 && (
              <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Please select at least two stocks to optimize your portfolio
              </div>
            )}

            <div className="flex justify-between gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Previous
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  key="next"
                  type="button"
                  className="ml-auto"
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && selectedTickers.length < 2) ||
                    (currentStep === 2 && !years) ||
                    (currentStep === 3 &&
                      (!investmentAmount || !targetAmount)) ||
                    (currentStep === 3 && exceedsBalance)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  key="submit"
                  type="submit"
                  className="ml-auto"
                  disabled={
                    pending ||
                    selectedTickers.length < 2 ||
                    !years ||
                    !investmentAmount ||
                    !targetAmount ||
                    exceedsBalance ||
                    (optimizationMethod === "custom_risk" && !riskScorePercent)
                  }
                >
                  {pending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Optimizing Portfolio...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Generate Optimal Portfolio</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </form>

          <AnimatePresence>
            {!state.success && state.message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 text-destructive text-sm bg-destructive/10 p-3 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {state.message}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
