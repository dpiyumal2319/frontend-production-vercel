"use client"

import {useState} from "react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {LineChart, PieChart} from "@/app/(dashboard)/dashboard/budget/_components/charts"
import {BudgetReports} from "@/app/(dashboard)/dashboard/budget/_components/budget-reports"
import {BudgetGoals} from "@/app/(dashboard)/dashboard/budget/_components/budget-goals"
import {BudgetPredictions} from "@/app/(dashboard)/dashboard/budget/_components/budget-predictions"
import {DollarSign, TrendingUp, PieChartIcon, Target} from "lucide-react"
import {
    CategoryBreakdown,
    getTransactionsByCategory,
} from "@/lib/budget-lib/budget_api" // Import our API functions
import {
    calculateBalanceTrendScore,
    calculateOverallScore,
    calculateSavingsScore,
    calculateSpendingScore
} from "@/app/(dashboard)/dashboard/budget/_utils/utils"
import {AddTransactionDialog} from "@/app/(dashboard)/dashboard/budget/_components/AddTransactionDialog";
import LoadingAnimation from "@/app/(dashboard)/_components/LoadingAnimation";
import {useBalance} from "@/context/BalanceContext"; // Import the custom context hook
import {useEffect} from "react";
import {getCurrentUser} from "@/actions/auth";

export default function Home() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [userId, setUserId] = useState<string>("")
    const [categories, setCategories] = useState<CategoryBreakdown[][]>([[], []])

    // Use the balance context instead of manual fetching
    const {data: summaryData, isLoading, refetch} = useBalance();

    useEffect(() => {
        const fetchCategories = async () => {
            if (!summaryData) return;

            try {
                // We still need to fetch categories separately
                const categoryData = await getTransactionsByCategory(userId);
                setCategories(categoryData);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        if (userId) {
            fetchCategories();
        }
    }, [userId, summaryData]);

    // Set userId when summaryData is available (assuming userId comes from getCurrentUser in the context)
    useEffect(() => {
        const initUser = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setUserId(user.user_id);
                }
            } catch (error) {
                console.error("Failed to get current user:", error);
            }
        };

        initUser();
    }, []);

    const handleSummaryValues = (val: number, val2: number) => {
        if (val2 === 0) {
            return ""
        }
        if (val > val2) {
            return "+" + ((val - val2) / val2 * 100).toFixed(2) + "%"
        }
        return ((val2 - val) / val2 * 100).toFixed(2) + "%"
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-6 px-8">
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex gap-4">
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

                    <div className="flex justify-end mb-4">
                        <AddTransactionDialog userId={userId} onTransactionAdded={refetch}/>
                    </div>
                </div>


                <TabsContent value="dashboard" className="space-y-6">
                    {isLoading || !summaryData ?
                        <div className="w-full h-screen">
                            <LoadingAnimation/>
                        </div>
                        :
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
                                             style={summaryData.balance > summaryData.previous_balance ? {color: "green"} : {color: "red"}}>{summaryData.previous_balance === 0 ? "" : `${handleSummaryValues(summaryData.balance, summaryData.previous_balance)} from last month`}</div>
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
                                             style={summaryData.income > summaryData.previous_income ? {color: "green"} : {color: "red"}}>{summaryData.previous_income === 0 ? "" : `${handleSummaryValues(summaryData.income, summaryData.previous_income)} from last month`}</div>
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
                                             style={summaryData.expense <= summaryData.previous_expense ? {color: "green"} : {color: "red"}}>{summaryData.previous_expense === 0 ? "" : `${handleSummaryValues(summaryData.expense, summaryData.previous_expense)} from last month`}</div>
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
        </div>
    )
}