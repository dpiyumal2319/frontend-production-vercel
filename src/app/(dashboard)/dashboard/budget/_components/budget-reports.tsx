"use client"

import {useEffect, useMemo, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {PieChart} from "./charts"
import {
    BudgetReport,
    BudgetReportResponse,
    categorizeTransaction,
    createTransaction,
    getBudgetReport,
    Transaction,
    TransactionCreate
} from "@/lib/budget-lib/budget_api"
import LoadingAnimation from "@/app/(dashboard)/_components/LoadingAnimation";

interface BudgetReportsProps {
    userId: string
}

export function BudgetReports({userId}: BudgetReportsProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [categoryTransactions, setCategoryTransactions] = useState<Record<string, Transaction[]>>({})
    const [budgetReport, setBudgetReport] = useState<BudgetReport | null>(null)

    const [newTransaction, setNewTransaction] = useState<Omit<TransactionCreate, 'user_id'>>({
        date: new Date().toLocaleString(),
        category: "",
        reason: "",
        created_at: new Date().toLocaleString(),
        amount: 0,
        type: "expense"
    })

    // Add these states at the top of your component
    const [currentPages, setCurrentPages] = useState({
        all: 1,
        expenses: 1,
        income: 1
    });
    const [itemsPerPage] = useState(8);

    // Calculate paginated transactions using useMemo
    const {currentTransactions, paginationData} = useMemo(() => {
        const allTransactions = transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const expenseTransactions = allTransactions.filter(t => t.type === 'expense');
        const incomeTransactions = allTransactions.filter(t => t.type === 'income');

        const getPaginatedData = (list: Transaction[], page: number) => {
            const indexOfLastItem = page * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            return list.slice(indexOfFirstItem, indexOfLastItem);
        };

        return {
            currentTransactions: {
                all: getPaginatedData(allTransactions, currentPages.all),
                expenses: getPaginatedData(expenseTransactions, currentPages.expenses),
                income: getPaginatedData(incomeTransactions, currentPages.income)
            },
            paginationData: {
                all: Math.ceil(allTransactions.length / itemsPerPage),
                expenses: Math.ceil(expenseTransactions.length / itemsPerPage),
                income: Math.ceil(incomeTransactions.length / itemsPerPage)
            }
        };
    }, [transactions, currentPages, itemsPerPage]);

    // Pagination controls component for each tab
    const PaginationControls = ({type}: { type: 'all' | 'expenses' | 'income' }) => {
        const currentPage = currentPages[type];
        const totalPages = paginationData[type];

        return (
            <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentPages(prev => ({
                        ...prev,
                        [type]: Math.max(prev[type] - 1, 1)
                    }))}
                    disabled={currentPage === 1}
                    className="bg-gray-700  border-gray-600"
                >
                    Previous
                </Button>
                <span className="">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setCurrentPages(prev => ({
                        ...prev,
                        [type]: Math.min(prev[type] + 1, totalPages)
                    }))}
                    disabled={currentPage === totalPages}
                    className="bg-gray-700  border-gray-600"
                >
                    Next
                </Button>
            </div>
        );
    };


    useEffect(() => {
        if (!userId) return

        const fetchData = async () => {
            try {
                setLoading(true)
                let reportData: BudgetReportResponse;
                const cachedReport = localStorage.getItem('report');

                if (cachedReport) {
                    reportData = JSON.parse(cachedReport);
                    if (reportData.transactions.length > 0) {
                        if (reportData.transactions[0].user_id != userId) {
                            // Note: Promise.all returns an array, but we only have one promise here
                            const [budgetReport] = await Promise.all([
                                getBudgetReport(userId),
                            ]);
                            reportData = budgetReport;

                            // Cache the report data
                            localStorage.setItem('report', JSON.stringify(budgetReport));
                        }
                    } else {
                        // Note: Promise.all returns an array, but we only have one promise here
                        const [budgetReport] = await Promise.all([
                            getBudgetReport(userId),
                        ]);
                        reportData = budgetReport;

                        // Cache the report data
                        localStorage.setItem('report', JSON.stringify(budgetReport));
                    }
                } else {
                    // Note: Promise.all returns an array, but we only have one promise here
                    const [budgetReport] = await Promise.all([
                        getBudgetReport(userId),
                    ]);
                    reportData = budgetReport;

                    // Cache the report data
                    localStorage.setItem('report', JSON.stringify(budgetReport));
                }


                setTransactions(reportData.transactions)
                setBudgetReport(reportData.budget_report)

                // // Group transactions by category for the pie chart
                // const grouped = transactions.reduce((acc, transaction) => {
                //   const category = transaction.category;

                //   // Initialize array if category doesn't exist
                //   if (!acc[category]) {
                //     acc[category] = [];
                //   }

                //   // Only include expense transactions for the pie chart
                //   if (transaction.type === 'expense') {  // or check transaction.type === 'expense'
                //     acc[category].push(transaction);
                //   }

                //   return acc;
                // }, {} as Record<string, Transaction[]>);
                // Group transactions by category for the pie chart
                const groupTransactionsByCategory = (transactions: Transaction[]) => {
                    const categoryMap = new Map<string, Transaction[]>();

                    transactions.forEach(transaction => {
                        // Skip if no category or not an expense (if you only want expenses)
                        if (!categoryMap.has(transaction.category)) {
                            categoryMap.set(transaction.category, []);
                        }
                        categoryMap.get(transaction.category)!.push(transaction);
                    });

                    // Convert Map to plain object
                    return Object.fromEntries(categoryMap.entries());
                };

                const grouped = groupTransactionsByCategory(reportData.transactions);
                setCategoryTransactions(grouped);
            } catch (err) {
                setError("Failed to fetch data")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId])

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newTransaction.reason || !newTransaction.amount || !newTransaction.date || (newTransaction.type === 'Expense' || newTransaction.type === 'Income')) {
            setError("Please fill all required fields")
            return
        }

        try {
            const transactionToCreate: TransactionCreate = {
                ...newTransaction,
                user_id: userId,
                amount: Number(newTransaction.amount),
                date: new Date(newTransaction.date).toISOString().replace("T", " ").split(".")[0],
                created_at: new Date(newTransaction.date).toISOString().replace("T", " ").split(".")[0],
                type: newTransaction.type.toLowerCase() as "expense" | "income"
            }

            const category_recieved = await categorizeTransaction(transactionToCreate.reason, transactionToCreate.amount, transactionToCreate.type);
            transactionToCreate.category = category_recieved.category;


            const createdTransaction = await createTransaction(transactionToCreate)
            // console.log(createdTransaction)
            localStorage.removeItem('report')
            localStorage.removeItem('prediction')
            setTransactions([...transactions, createdTransaction])

            // Update category transactions
            const updatedCategoryTransactions = {...categoryTransactions}
            if (!updatedCategoryTransactions[createdTransaction.category]) {
                updatedCategoryTransactions[createdTransaction.category] = []
            }
            updatedCategoryTransactions[createdTransaction.category].push(createdTransaction)
            setCategoryTransactions(updatedCategoryTransactions)

            setNewTransaction({
                date: new Date().toISOString().split("T")[0],
                category: "",
                created_at: new Date().toLocaleDateString(),
                reason: "",
                amount: 0,
                type: "expense"
            })
            setError(null)
        } catch (err) {
            setError("Failed to create transaction")
            console.error(err)
        }
    }

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const getLargestCategory = () => {
        const categoryTotals = Object.entries(categoryTransactions).map(([category, txns]) => {
            const total = txns
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
            return [category, total]
        })

        const sorted = categoryTotals.sort((a, b) => b[1] as number - (a[1] as number))
        return sorted.length > 0 ? sorted[0] : ["N/A", 0]
    }

    const [largestCategory, largestAmount] = getLargestCategory()
    const netSavings = budgetReport?.summary?.net_savings ?? 0
    const totalIncome = budgetReport?.summary?.total_income ?? 0
    const savingsPercentage = totalIncome > 0 ? (netSavings / totalIncome * 100).toFixed(1) : 0

    if (loading) {
        return (
            <div className={'min-h-screen flex items-center justify-center'}>
                <LoadingAnimation/>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-400">{error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Expenses</CardTitle>
                        <CardDescription>Current month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold ">${totalExpenses.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Net Savings</CardTitle>
                        <CardDescription>Current month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold ">${netSavings.toFixed(2)}</div>
                        <div className="text-sm text-amber-400 mt-1">{savingsPercentage}% of income saved</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Largest Expense</CardTitle>
                        <CardDescription>Current month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold ">{largestCategory}</div>
                        <div
                            className="text-sm text-gray-300 mt-1">${typeof largestAmount === 'number' ? largestAmount.toFixed(2) : 0}</div>
                    </CardContent>
                </Card>
            </div>

            {budgetReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-300">
                                {budgetReport.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="">Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-red-300">
                                {budgetReport.alerts.map((alert, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{alert}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="all">
                <TabsList className="mb-4 bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger value="all"
                                 className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:">
                        All Transactions
                    </TabsTrigger>
                    <TabsTrigger value="expenses"
                                 className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:">
                        Expense List
                    </TabsTrigger>
                    <TabsTrigger value="income"
                                 className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:">
                        Income List
                    </TabsTrigger>
                    <TabsTrigger value="chart"
                                 className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:">
                        Charts
                    </TabsTrigger>
                    <TabsTrigger value="add"
                                 className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:">
                        Add Transactions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <div className="grid gap-4">
                        {currentTransactions.all.map(txn => (
                            <Card key={txn.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className=" text-lg font-semibold">
                                                {txn.reason}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {txn.category}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xl font-bold ${txn.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                {txn.type === 'expense' ? '-' : '+'}
                                                ${Math.abs(txn.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">
                                            {new Date(txn.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {txn.type === 'expense' && txn.amount && (
                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                                                Expense
                                            </span>
                                        )}
                                        {txn.type === 'income' && (
                                            <span
                                                className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                                Income
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <PaginationControls type="all"/>
                    </div>
                </TabsContent>

                <TabsContent value="expenses">
                    <div className="grid gap-4">
                        {currentTransactions.expenses.map(txn => (
                            <Card key={txn.id}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className=" text-lg font-semibold">
                                                {txn.reason}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400 mt-1">
                                                {txn.category}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xl font-bold ${txn.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                {txn.type === 'expense' ? '-' : '+'}
                                                ${Math.abs(txn.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">
                                            {new Date(txn.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {txn.type === 'expense' && txn.amount && (
                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                                                Expense
                                            </span>
                                        )}
                                        {txn.type === 'income' && (
                                            <span
                                                className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                                Income
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <PaginationControls type="expenses"/>
                    </div>
                </TabsContent>

                <TabsContent value="income">
                    <div className="grid gap-4">
                        {currentTransactions.income.map(txn => (
                            <Card key={txn.id}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className=" text-lg font-semibold">
                                                {txn.reason}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400 mt-1">
                                                {txn.category}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xl font-bold ${txn.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                {txn.type === 'expense' ? '-' : '+'}
                                                ${Math.abs(txn.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">
                                            {new Date(txn.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {txn.type === 'expense' && txn.amount && (
                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                                                Expense
                                            </span>
                                        )}
                                        {txn.type === 'income' && (
                                            <span
                                                className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                                Income
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <PaginationControls type="income"/>
                    </div>
                </TabsContent>

                <TabsContent value="chart">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Distribution</CardTitle>
                            <CardDescription>Breakdown by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96">
                                <PieChart
                                    darkMode={true}
                                    data={Object.entries(categoryTransactions)
                                        .map(([category, transactions]) => {
                                            // Filter for expense transactions only
                                            const expenseTransactions = transactions.filter(t => t.type === 'expense');

                                            return {
                                                category: category,  // PieChart typically expects 'name' instead of 'category'
                                                amount: expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                            };
                                        })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Income Distribution</CardTitle>
                            <CardDescription>Breakdown by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96">
                                <PieChart
                                    darkMode={true}
                                    data={Object.entries(categoryTransactions)
                                        .map(([category, transactions]) => {
                                            // Filter for expense transactions only
                                            const expenseTransactions = transactions.filter(t => t.type === 'income');

                                            return {
                                                category: category,  // PieChart typically expects 'name' instead of 'category'
                                                amount: expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                            };
                                        })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="add">
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="">Date</Label>
                                <Input type="date" value={newTransaction.date}
                                       onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}/>
                            </div>
                            <div>
                                <Label className="">Amount</Label>
                                <Input type="number" min="0" step="0.01" value={newTransaction.amount}
                                       onChange={e => setNewTransaction({
                                           ...newTransaction,
                                           amount: parseFloat(e.target.value)
                                       })}/>
                            </div>
                            {/* <div>
                <Label className="">Category</Label>
                <Input value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })} />
              </div> */}
                            <div>
                                <Label className="">Description</Label>
                                <Input value={newTransaction.reason}
                                       onChange={e => setNewTransaction({...newTransaction, reason: e.target.value})}/>
                            </div>
                            <div>
                                <Label className="">Type</Label>
                                <Select
                                    value={newTransaction.type}
                                    onValueChange={(value) => setNewTransaction({
                                        ...newTransaction,
                                        type: value.toLowerCase()
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" className="mt-2">Add Transaction</Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    )
}