"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, ArrowUpRight, TrendingUp, TrendingDown, LineChartIcon} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {useEffect, useState} from "react"
import {getPredictions} from "@/lib/budget-lib/budget_api"
import {PredictionResponse} from "@/lib/budget-lib/budget_api"
import {AddGoalDialog} from "./add-goal-dialog"
import LoadingAnimation from "@/app/(dashboard)/_components/LoadingAnimation";

interface BudgetPredictionProps {
    userId: string
}

export function BudgetPredictions({userId}: BudgetPredictionProps) {
    const [data, setData] = useState<PredictionResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                let predictionData: PredictionResponse;
                const cachedPrediction = localStorage.getItem('prediction');

                if (cachedPrediction) {
                    predictionData = JSON.parse(cachedPrediction);
                    if (predictionData.predictions.uid != userId) {
                        const response = await getPredictions(userId);
                        predictionData = response;
                        localStorage.setItem('prediction', JSON.stringify(response));
                    }
                } else {
                    const response = await getPredictions(userId);
                    predictionData = response;
                    localStorage.setItem('prediction', JSON.stringify(response));
                }

                setData(predictionData)
            } catch (err) {
                console.error("Error fetching predictions:", err)
                setError("Failed to load prediction data")
            } finally {
                setLoading(false)
            }
        }
        fetchPredictions()
    }, [userId])

    if (loading) {
        return (
            <div className={'min-h-screen'}>
                <LoadingAnimation/>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="bg-red-900/30 border-red-800/30">
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-gray-300">
                    {error}
                </AlertDescription>
            </Alert>
        )
    }

    if (!data) {
        return (
            <Alert className="bg-blue-900/30 border-blue-800/30">
                <AlertCircle className="h-4 w-4 text-blue-400"/>
                <AlertTitle className="text-white">No Data Available</AlertTitle>
                <AlertDescription className="text-gray-300">
                    {"We couldn't find any prediction data for your account."}
                </AlertDescription>
            </Alert>
        )
    }

    // Extract predictions from data
    const {predictions, financial_advice, budget_goals} = data

    // Create prediction cards data dynamically
    const predictionCards = [
        {
            title: "Income Next Day",
            value: predictions.income_next_day,
            currentValue: predictions.today_income,
            category: "Income",
            timeFrame: "Next Day",
            icon: TrendingUp
        },
        {
            title: "Income Next Week",
            value: predictions.income_next_week,
            currentValue: predictions.this_week_income,
            category: "Income",
            timeFrame: "Next Week",
            icon: TrendingUp
        },
        {
            title: "Income Next Month",
            value: predictions.income_next_month,
            currentValue: predictions.this_month_income,
            category: "Income",
            timeFrame: "Next Month",
            icon: TrendingUp
        },
        {
            title: "Expense Next Day",
            value: predictions.expense_next_day,
            currentValue: predictions.today_expense,
            category: "Expense",
            timeFrame: "Next Day",
            icon: TrendingDown
        },
        {
            title: "Expense Next Week",
            value: predictions.expense_next_week,
            currentValue: predictions.this_week_expense,
            category: "Expense",
            timeFrame: "Next Week",
            icon: TrendingDown
        },
        {
            title: "Expense Next Month",
            value: predictions.expense_next_month,
            currentValue: predictions.this_month_expense,
            category: "Expense",
            timeFrame: "Next Month",
            icon: TrendingDown
        }
    ].filter(prediction => prediction.value !== undefined)

    // Calculate financial metrics
    const monthlyNet = predictions.income_next_month - predictions.expense_next_month
    const weeklySavingsPotential = predictions.income_next_week - predictions.expense_next_week

    return (
        <div className="space-y-6 p-8">
            <Alert className="bg-blue-900/30 border-blue-800/30">
                <AlertCircle className="h-4 w-4 text-blue-400"/>
                <AlertTitle className="text-white">Budget Predictions</AlertTitle>
                <AlertDescription className="text-gray-300">
                    These predictions are based on your historical financial data and current spending patterns.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Cash Flow Forecast</CardTitle>
                        <CardDescription className="text-gray-300">Projected cash flow for the next
                            month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${monthlyNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${Math.abs(monthlyNet).toFixed(2)} {monthlyNet >= 0 ? 'Surplus' : 'Deficit'}
                        </div>
                        <p className="text-gray-300 mt-2">Predicted for next month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Savings Opportunity</CardTitle>
                        <CardDescription className="text-gray-300">Potential savings next week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${weeklySavingsPotential >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            ${Math.abs(weeklySavingsPotential).toFixed(2)} {weeklySavingsPotential >= 0 ? 'Savings' : 'Shortfall'}
                        </div>
                        <p className="text-gray-300 mt-2">Could be saved or used to pay debt</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="insights">
                <TabsList className="mb-4 bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger
                        value="insights"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Insights
                    </TabsTrigger>
                    <TabsTrigger
                        value="recommendations"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Recommendations
                    </TabsTrigger>
                    <TabsTrigger
                        value="goals"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Budget Goals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="insights">
                    <div className="space-y-6">
                        {predictionCards.map((prediction, i) => {
                            const isPositive = prediction.value >= prediction.currentValue
                            const isIncome = prediction.category === "Income"
                            const Icon = prediction.icon

                            return (
                                <Card key={i} className="bg-gray-800 border-gray-700 shadow-md">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center text-white">
                                                    <Icon className={`h-5 w-5 mr-2 ${isIncome
                                                        ? isPositive ? 'text-green-400' : 'text-red-400'
                                                        : isPositive ? 'text-red-400' : 'text-green-400'
                                                    }`}/>
                                                    {prediction.title}
                                                </CardTitle>
                                                <CardDescription className="text-gray-300">
                                                    {prediction.category} • {prediction.timeFrame}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                className={
                                                    isIncome
                                                        ? isPositive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                                        : isPositive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                                }
                                            >
                                                {isPositive ? (isIncome ? 'Increase' : 'Increase') : (isIncome ? 'Decrease' : 'Decrease')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-200">Current:
                                                    ${prediction.currentValue?.toFixed(2) || '0.00'}</p>
                                                <p className="text-gray-200">Predicted:
                                                    ${prediction.value.toFixed(2)}</p>
                                            </div>
                                            <div className={`text-lg font-semibold ${isIncome
                                                ? isPositive ? 'text-green-400' : 'text-red-400'
                                                : isPositive ? 'text-red-400' : 'text-green-400'
                                            }`}>
                                                {((prediction.value - prediction.currentValue) / prediction.currentValue * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="recommendations">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-white">Financial Recommendations</CardTitle>
                            <CardDescription className="text-gray-300">
                                AI-powered suggestions to improve your finances
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {financial_advice.observations && (
                                <div className="p-4 border border-gray-600 rounded-lg">
                                    <div className="font-medium mb-1 text-white">Observations</div>
                                    <div className="text-sm text-gray-300">{financial_advice.observations}</div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {financial_advice.daily_actions && (
                                    <div className="p-4 border border-gray-600 rounded-lg">
                                        <div className="flex items-start">
                                            <ArrowUpRight className="h-5 w-5 mr-2 text-green-400 mt-0.5"/>
                                            <div>
                                                <div className="font-medium mb-1 text-white">Daily Actions</div>
                                                <div
                                                    className="text-sm text-gray-300">{financial_advice.daily_actions}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {financial_advice.weekly_actions && (
                                    <div className="p-4 border border-gray-600 rounded-lg">
                                        <div className="flex items-start">
                                            <ArrowUpRight className="h-5 w-5 mr-2 text-blue-400 mt-0.5"/>
                                            <div>
                                                <div className="font-medium mb-1 text-white">Weekly Actions</div>
                                                <div
                                                    className="text-sm text-gray-300">{financial_advice.weekly_actions}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {financial_advice.monthly_actions && (
                                    <div className="p-4 border border-gray-600 rounded-lg">
                                        <div className="flex items-start">
                                            <ArrowUpRight className="h-5 w-5 mr-2 text-purple-400 mt-0.5"/>
                                            <div>
                                                <div className="font-medium mb-1 text-white">Monthly Actions</div>
                                                <div
                                                    className="text-sm text-gray-300">{financial_advice.monthly_actions}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {financial_advice.risks && (
                                <Alert className="bg-red-900/30 border-red-600/30 border">
                                    <AlertCircle className="h-4 w-4 text-red-400"/>
                                    <AlertTitle className="text-white">Potential Risks</AlertTitle>
                                    <AlertDescription className="text-gray-300">
                                        {financial_advice.risks}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {financial_advice.long_term_insights && (
                                <Alert className="bg-green-900/30 border-green-600/30 border">
                                    <LineChartIcon className="h-4 w-4 text-green-400"/>
                                    <AlertTitle className="text-white">Long Term Insights</AlertTitle>
                                    <AlertDescription className="text-gray-300">
                                        {financial_advice.long_term_insights}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    {budget_goals?.length > 0 && <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-white">Budget Goals</CardTitle>
                                    <CardDescription className="text-gray-300">
                                        Recommended financial targets based on your situation
                                    </CardDescription>
                                </div>
                                <AddGoalDialog userId={userId} goal={budget_goals[0]}/>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {budget_goals?.length > 0 ? (
                                budget_goals.map((goal, i) => (
                                    <div key={i} className="p-4 border border-gray-600 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-white">
                                                    {goal.time_period ? `${goal.time_period.charAt(0).toUpperCase()}${goal.time_period.slice(1)} Goal` : `Goal ${i + 1}`}
                                                </h3>
                                                {goal.description && (
                                                    <p className="text-sm text-gray-300 mt-1">{goal.description}</p>
                                                )}
                                                {/* {goal.deadline && (
                          <p className="text-xs text-gray-400 mt-1">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )} */}
                                            </div>
                                            <Badge className="bg-blue-600">
                                                ${goal.amount?.toFixed(2) || '0.00'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No budget goals available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>}
                </TabsContent>
            </Tabs>
        </div>
    )
}