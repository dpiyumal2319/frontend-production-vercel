"use client"

import {useEffect, useState} from "react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {LineChart, PieChart} from "@/app/(dashboard)/dashboard/budget/_components/charts"
import {BudgetReports} from "@/app/(dashboard)/dashboard/budget/_components/budget-reports"
import {BudgetGoals} from "@/app/(dashboard)/dashboard/budget/_components/budget-goals"
import {BudgetPredictions} from "@/app/(dashboard)/dashboard/budget/_components/budget-predictions"
import {AIChat} from "@/app/(dashboard)/dashboard/budget/_components/ai-chat"
import {DollarSign, TrendingUp, PieChartIcon, Target} from "lucide-react"
import {CategoryBreakdown, getTransactionsByCategory, getTransactionSummary} from "@/lib/budget-lib/budget_api" // Import our API functions
import {getCurrentUser} from "@/actions/auth"
import {
    calculateBalanceTrendScore,
    calculateOverallScore,
    calculateSavingsScore,
    calculateSpendingScore
} from "@/app/(dashboard)/dashboard/budget/_utils/utils"
import {AddTransactionDialog} from "@/app/(dashboard)/dashboard/budget/_components/AddTransactionDialog";

export interface TransactionSummary {
    income: number;
    expense: number;
    balance: number;
    previousIncome: number;
    previousExpense: number;
    previousBalance: number;
    transactions: {
        date: string;
        balance: number;
    }[];
}

export default function Home() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string>("") // You'll need to get this from your auth system
    const [summaryData, setSummaryData] = useState<TransactionSummary>({
        income: 0,
        expense: 0,
        balance: 0,
        previousIncome: 0,
        previousExpense: 0,
        previousBalance: 0,
        transactions: []
    })
    const [categories, setCategories] = useState<CategoryBreakdown[][]>([[], []])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true when starting to fetch
            // In a real app, you'd get the user ID from your auth system
            const user = await getCurrentUser()

            try {
                setUserId(user!.user_id)

                // Fetch summary data
                const summary = await getTransactionSummary(user!.user_id)
                setSummaryData({
                    income: summary.income,
                    expense: summary.expense,
                    balance: summary.balance,
                    previousIncome: summary.previous_income,
                    previousExpense: summary.previous_expense,
                    previousBalance: summary.previous_balance,
                    transactions: summary.transactions
                })

                // Fetch categories
                const categoryData = await getTransactionsByCategory(user!.user_id)
                setCategories(categoryData)

            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setIsLoading(false); // Set loading to false when done (whether success or error)
            }
        }

        fetchData().then()
    }, [])

    const handleSummaryValues = (val: number, val2: number) => {
        if (val2 == 0) {
            return ""
        }
        if (val > val2) {
            return "+" + ((val2 - val) / val2 * 100).toFixed(2) + "%"
        }
        return ((val2 - val) / val2 * 100).toFixed(2) + "%"
    }

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen bg-background text-foreground">

    //             <div className="flex flex-col items-center justify-center h-[70vh]">
    //                 <div
    //                     className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    //                 <p className="text-foreground">Loading your financial data...</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="min-h-screen bg-background text-foreground py-6 px-8">
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className={'flex gap-4'}>
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="dashboard"
                            className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <DollarSign className="h-4 w-4"/>
                            <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="goals"
                            className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <Target className="h-4 w-4"/>
                            <span className="hidden sm:inline">Budget Goals</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <PieChartIcon className="h-4 w-4"/>
                            <span className="hidden sm:inline">Budget Reports</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="predictions"
                            className="flex items-center gap-2 text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <TrendingUp className="h-4 w-4"/>
                            <span className="hidden sm:inline">Predictions</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className={'flex justify-end mb-4'}>
                        <AddTransactionDialog userId={userId}/>
                    </div>
                </div>


                <TabsContent value="dashboard" className="space-y-6">
                    {isLoading ? <div className="min-h-screen bg-background text-foreground">

                            <div className="flex flex-col items-center justify-center h-[70vh]">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-foreground">Loading your financial data...</p>
                            </div>

                        </div> :
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-white">Monthly Balance</CardTitle>
                                        <CardDescription className="text-foreground">Your current financial
                                            status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">${summaryData.balance}</div>
                                        <div className="text-sm text-green-400 mt-1"
                                             style={summaryData.balance > summaryData.previousBalance ? {color: "green"} : {color: "red"}}>{summaryData.previousBalance === 0 ? "" : `${handleSummaryValues(summaryData.balance, summaryData.previousBalance)} from last month`}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-white">Monthly Income</CardTitle>
                                        <CardDescription className="text-foreground">Your income this
                                            month</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">${summaryData.income}</div>
                                        <div className="text-sm text-green-400 mt-1"
                                             style={summaryData.income > summaryData.previousIncome ? {color: "green"} : {color: "red"}}>{summaryData.previousIncome === 0 ? "" : `${handleSummaryValues(summaryData.income, summaryData.previousIncome)} from last month`}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-white">Monthly Expenses</CardTitle>
                                        <CardDescription className="text-foreground">Your expenses this
                                            month</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-white">${summaryData.expense}</div>
                                        <div className="text-sm text-green-400 mt-1"
                                             style={summaryData.expense <= summaryData.previousExpense ? {color: "green"} : {color: "red"}}>{summaryData.previousExpense === 0 ? "" : `${handleSummaryValues(summaryData.expense, summaryData.previousExpense)} from last month`}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-white">Financial Overview</CardTitle>
                                        <CardDescription className="text-foreground">Your financial balance per each day
                                            at a
                                            glance</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center h-full">
                                        <div className="relative w-full" style={{height: '300px'}}>
                                            <LineChart
                                                darkMode={true}
                                                data={summaryData.transactions.map(t => t.balance)}
                                                labels={summaryData.transactions.map(t => t.date)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-white">Expense Breakdown</CardTitle>
                                        <CardDescription className="text-foreground">Where your money is
                                            going</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PieChart darkMode={true} data={categories[0]}/>
                                    </CardContent>
                                    <CardHeader>
                                        <CardTitle className="text-white">Income Breakdown</CardTitle>
                                        <CardDescription className="text-foreground">Where your money is
                                            coming</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PieChart darkMode={true} data={categories[1]}/>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-white">Financial Health Score</CardTitle>
                                    <CardDescription className="text-foreground">
                                        Based on your spending, savings, and investments
                                    </CardDescription>
                                </CardHeader>
                                {summaryData ?
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Overall Score */}
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Overall Score</span>
                                                <span className="font-medium">
                                                    {summaryData.transactions.length !== 0 ? calculateOverallScore(summaryData) : 0}/100
                                                </span>
                                            </div>
                                            <Progress
                                                value={summaryData.transactions.length !== 0 ? calculateOverallScore(summaryData) : 0}
                                            />

                                            {/* Breakdown */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                                {/* Savings Score */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Savings</span>
                                                        <span className="font-medium">
                                                            {summaryData.transactions.length !== 0 ? calculateSavingsScore(summaryData) : 0}/100
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={summaryData.transactions.length !== 0 ? calculateSavingsScore(summaryData) : 0}
                                                    />
                                                </div>

                                                {/* Spending Score */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Spending</span>
                                                        <span className="font-medium">
                                                            {summaryData.transactions.length !== 0 ? calculateSpendingScore(summaryData) : 0}/100
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={summaryData.transactions.length !== 0 ? calculateSpendingScore(summaryData) : 0}
                                                    />
                                                </div>

                                                {/* Balance Trend */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Balance Trend</span>
                                                        <span className="font-medium">
                                                            {summaryData.transactions.length !== 0 ? calculateBalanceTrendScore(summaryData) : 0}/100
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={summaryData.transactions.length !== 0 ? calculateBalanceTrendScore(summaryData) : 0}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    :
                                    <CardContent></CardContent>}
                            </Card>
                        </div>}
                </TabsContent>

                <TabsContent value="goals">
                    <BudgetGoals userId={userId}/>
                </TabsContent>

                <TabsContent value="reports">
                    <BudgetReports userId={userId}/>
                </TabsContent>

                <TabsContent value="predictions">
                    <BudgetPredictions userId={userId}/>
                </TabsContent>
            </Tabs>

            {/* Floating AI Chat Button */}
            <AIChat/>
        </div>
    )
}