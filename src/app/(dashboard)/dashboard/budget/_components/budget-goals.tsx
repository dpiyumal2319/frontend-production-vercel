"use client"

import React, {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {LineChart} from "./charts"
import {
    BudgetGoal,
    BudgetGoalCreate,
    createBudgetGoal,
    deleteBudgetGoal,
    getBudgetGoals,
    updateBudgetGoal
} from "@/lib/budget-lib/budget_api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Calendar, Check, X} from "lucide-react"
import LoadingAnimation from "@/app/(dashboard)/_components/LoadingAnimation";

interface BudgetGoalsProps {
    userId: string
}

export function BudgetGoals({userId}: BudgetGoalsProps) {
    const [goals, setGoals] = useState<BudgetGoal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const [newGoal, setNewGoal] = useState<Omit<BudgetGoalCreate, 'user_id'>>({
        title: "",
        category: "",
        amount: 0,
        created_at: new Date().toISOString(),
        deadline: "",
    })

    // Fetch goals when userId changes
    useEffect(() => {
        if (!userId) return

        const fetchGoals = async () => {
            try {
                setLoading(true)
                const data = await getBudgetGoals(userId)
                const filtered = data.filter(g => g.title.startsWith("FALSE") || g.title.startsWith("TRUE"))
                setGoals(filtered)
            } catch (err) {
                setError("Failed to fetch goals")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchGoals().then()
    }, [userId])

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newGoal.title || !newGoal.amount || !newGoal.deadline || !newGoal.category) {
            setError("Please fill all required fields")
            return
        }

        try {
            const goalToCreate: BudgetGoalCreate = {
                ...newGoal,
                user_id: userId,
                amount: Number(newGoal.amount),
                title: "FALSE:" + newGoal.title,
            }

            await createBudgetGoal(goalToCreate)
            const goals = await getBudgetGoals(userId)
            const filtered = goals.filter(g => g.title != "")
            setGoals(filtered)
            setGoals(goals)

            // Reset form
            setNewGoal({
                title: "",
                category: "",
                amount: 0,
                created_at: new Date().toISOString(),
                deadline: "",
            })
            setError(null)
        } catch (err) {
            setError("Failed to create goal")
            console.error(err)
        }
    }

    const handleUpdateGoal = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editingGoal) return

        try {
            const updatedGoal = await updateBudgetGoal(editingGoal.id, {
                title: editingGoal.title,
                amount: editingGoal.amount,
                deadline: editingGoal.deadline
            })

            setGoals(goals.map(goal => goal.id === editingGoal.id ? {...goal, ...updatedGoal} : goal))
            setIsEditDialogOpen(false)
            setEditingGoal(null)
        } catch (err) {
            setError("Failed to update goal")
            console.error(err)
        }
    }

    const handleDeleteGoal = async (goalId: number) => {
        try {
            await deleteBudgetGoal(goalId)
            setGoals(goals.filter(goal => goal.id !== goalId))
        } catch (err) {
            setError("Failed to delete goal")
            console.error(err)
        }
    }

    const handleToggleStatus = async (goal: BudgetGoal) => {
        try {
            await updateBudgetGoal(goal.id, {
                title: goal.title.split(":")[0] === "TRUE" ? "FALSE:" + goal.title.split(":")[1] : "TRUE:" + goal.title.split(":")[1],
                amount: goal.amount,
                deadline: goal.deadline
            })
            setGoals(goals.map(g => g.id === goal.id ? {
                ...g,
                title: goal.title.split(":")[0] === "TRUE" ? "FALSE:" + goal.title.split(":")[1] : "TRUE:" + goal.title.split(":")[1]
            } : g))

        } catch (err) {
            setError("Failed to delete goal")
            console.error(err)
        }
    }

    const categories = ["Savings", "Housing", "Education", "Retirement", "Lifestyle", "Debt", "Other"]

    const today = new Date()
    const overdueGoals = goals.filter(goal => new Date(goal.deadline) < today && goal.title.startsWith("FALSE"))
    const upcomingGoals = goals.filter(goal => new Date(goal.deadline) >= today && goal.title.startsWith("FALSE"))
    const completedGoals = goals.filter(goal => goal.title.startsWith("TRUE"))

    const getNextDeadlineGoal = () => {
        if (goals.length === 0) return null

        // Sort by deadline (ascending)
        return [...goals].sort((a, b) =>
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )[0]
    }

    const nextDeadlineGoal = getNextDeadlineGoal()

    if (loading) {
        return (
            <div className="min-h-screen">

                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <LoadingAnimation/>
                </div>

            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-400">{error}</div>
    }

    return (
        <div className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Active Goals</CardTitle>
                        <CardDescription>Your financial targets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-3xl font-bold text-yello">{goals.filter(g => g.title.startsWith("FALSE")).length}</div>
                        <div className="text-smtext-muted mt-1">
                            Across {new Set(goals.filter(g => g.title.startsWith("FALSE")).map((g) => g.category)).size} categories
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Completed Goals</CardTitle>
                        <CardDescription>Your financial targets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="text-3xl font-bold text-green">{goals.filter(g => g.title.startsWith("TRUE")).length}</div>
                        <div className="text-smtext-muted mt-1">
                            Across {new Set(goals.filter(g => g.title.startsWith("TRUE")).map((g) => g.category)).size} categories
                        </div>
                    </CardContent>
                </Card>
                {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle >Total Amount</CardTitle>
            <CardDescription >All goals combined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold ">
              ${goals.reduce((sum, g) => sum + g.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card> */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Next Deadline</CardTitle>
                        <CardDescription>Upcoming goal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextDeadlineGoal ? (
                            <>
                                <div className="text-3xl font-bold ">
                                    {nextDeadlineGoal.title.split(":")[1]}
                                </div>
                                <div className="text-smtext-muted mt-1">
                                    Due: {new Date(nextDeadlineGoal.deadline).toLocaleDateString()}
                                </div>
                            </>
                        ) : (
                            <div>No upcoming goals</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="active">
                <TabsList className="mb-4 bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger
                        value="active"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:"
                    >
                        Active Goals
                    </TabsTrigger>
                    <TabsTrigger
                        value="add"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:"
                    >
                        Add Goal
                    </TabsTrigger>
                    <TabsTrigger
                        value="projections"
                        className="text-gray-200 data-[state=active]:bg-blue-600 data-[state=active]:"
                    >
                        Projections
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <div className="space-y-6">
                        {goals.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="">No Goals Found</CardTitle>
                                    <CardDescription>
                                        Create your first financial goal to get started
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <>
                                {overdueGoals.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-red-400 flex items-center">
                                            <Calendar className="mr-2 h-5 w-5"/>
                                            Overdue Goals
                                        </h2>

                                        {overdueGoals.map((goal) => (
                                            <GoalCard
                                                key={goal.id}
                                                goal={goal}
                                                onDelete={handleDeleteGoal}
                                                onEdit={(goal) => {
                                                    setEditingGoal(goal)
                                                    setIsEditDialogOpen(true)
                                                }}
                                                onStatusToggled={handleToggleStatus}
                                                isOverdue={true}
                                            />
                                        ))}
                                    </div>
                                )}

                                {upcomingGoals.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-yellow-400 flex items-center mt-6">
                                            <Calendar className="mr-2 h-5 w-5"/>
                                            Upcoming Goals
                                        </h2>

                                        {upcomingGoals.map((goal) => (
                                            <GoalCard
                                                key={goal.id}
                                                goal={goal}
                                                onDelete={handleDeleteGoal}
                                                onEdit={(goal) => {
                                                    setEditingGoal(goal)
                                                    setIsEditDialogOpen(true)
                                                }}
                                                onStatusToggled={handleToggleStatus}
                                                isOverdue={false}
                                            />
                                        ))}
                                    </div>
                                )}
                                {completedGoals.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-green-400 flex items-center mt-6">
                                            <Calendar className="mr-2 h-5 w-5"/>
                                            Completed Goals
                                        </h2>

                                        {completedGoals.map((goal) => (
                                            <GoalCard
                                                key={goal.id}
                                                goal={goal}
                                                onDelete={handleDeleteGoal}
                                                onEdit={(goal) => {
                                                    setEditingGoal(goal)
                                                    setIsEditDialogOpen(true)
                                                }}
                                                onStatusToggled={handleToggleStatus}
                                                isOverdue={false}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle className="">Create New Goal</CardTitle>
                            <CardDescription>Set a new financial target</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && <div className="mb-4 text-red-400">{error}</div>}
                            <form onSubmit={handleAddGoal} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-gray-200">
                                        Goal Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                                        placeholder="e.g., New Car Fund"
                                        className="bg-gray-700 border-gray-600  placeholder:text-gray-400"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-200">
                                        Category
                                    </Label>
                                    <Select
                                        value={newGoal.category}
                                        onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                                        required
                                    >
                                        <SelectTrigger id="category"
                                                       className="bg-gray-700 border-gray-600 text-gray-200">
                                            <SelectValue placeholder="Select category"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-gray-200">
                                        Amount ($)
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={newGoal.amount || ""}
                                        onChange={(e) => setNewGoal({...newGoal, amount: Number(e.target.value)})}

                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline" className="text-gray-200">
                                        Deadline
                                    </Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}

                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    Create Goal
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projections">
                    <Card>
                        <CardHeader>
                            <CardTitle className="">Goal Projections</CardTitle>
                            <CardDescription>Your financial goals timeline</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium  mb-4">Goals Overview</h3>
                                    <LineChart
                                        darkMode={true}
                                        data={goals.map(g => g.amount)}
                                        labels={goals.map(g => g.title.split(":")[1])}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium ">Goal Timeline</h3>
                                    <div className="relative">
                                        <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-card"/>

                                        <div className="space-y-8">
                                            {goals.map((goal, index) => {
                                                const colors = ["bg-green-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"]
                                                const color = colors[index % colors.length]

                                                return (
                                                    <div key={goal.id} className="relative pl-8 ml-[15%]">
                                                        <div
                                                            className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${color}`}/>
                                                        <div
                                                            className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                                                            <div
                                                                className="font-medium ">{goal.title.split(":")[1]}</div>
                                                            <div className="text-smtext-muted">
                                                                {new Date(goal.deadline).toLocaleDateString()} •
                                                                ${goal.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Goal Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-gray-800 border-gray-700 ">
                    <DialogHeader>
                        <DialogTitle className="">Edit Goal</DialogTitle>
                        <DialogDescription>
                            Update your financial goal details
                        </DialogDescription>
                    </DialogHeader>

                    {editingGoal && (
                        <form onSubmit={handleUpdateGoal} className="space-y-4 mt-2">
                            {/* <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-gray-200">
                  Goal Title
                </Label>
                <Input
                  id="edit-title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  
                  required
                />
              </div> */}

                            <div className="space-y-2">
                                <Label htmlFor="edit-amount" className="text-gray-200">
                                    Amount ($)
                                </Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={editingGoal.amount}
                                    onChange={(e) => setEditingGoal({...editingGoal, amount: Number(e.target.value)})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-deadline" className="text-gray-200">
                                    Deadline
                                </Label>
                                <Input
                                    id="edit-deadline"
                                    type="date"
                                    value={editingGoal.deadline.split('T')[0]} // Extract just the date part
                                    onChange={(e) => setEditingGoal({...editingGoal, deadline: e.target.value})}
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" type="button" onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Separate component for each goal card
function GoalCard({
                      goal,
                      onDelete,
                      onEdit,
                      onStatusToggled,
                      isOverdue
                  }: {
    goal: BudgetGoal,
    onDelete: (id: number) => void,
    onEdit: (goal: BudgetGoal) => void,
    onStatusToggled: (goal: BudgetGoal) => void,
    isOverdue: boolean
}) {
    const daysUntilDeadline = () => {
        const today = new Date()
        const deadline = new Date(goal.deadline)
        const diffTime = deadline.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const days = daysUntilDeadline()

    return (
        <Card className={`bg-gray-800 border-gray-700 ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="">{goal.title.split(":")[1]}</CardTitle>
                        <CardDescription>
                            {goal.category}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold ">
                            ${goal.amount.toLocaleString()}
                        </div>
                        <div className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                            {isOverdue
                                ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
                                : `Due in ${days} day${days !== 1 ? 's' : ''}`}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-gray-200 flex justify-between">
                    <span>Created: {new Date(goal.created_at).toLocaleDateString()}</span>
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {goal.title.split(":")[0] === "FALSE" ? <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-200 border-gray-600"
                    onClick={() => onEdit(goal)}
                >
                    Edit Goal
                </Button> : <></>}
                <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-200 border-gray-600 hover:bg-gray-700"
                    onClick={() => onStatusToggled(goal)}
                >
                    {goal.title.split(":")[0] === "TRUE" ? (
                        <div className="flex items-center gap-1 text-red-400">
                            <X className="h-4 w-4 text-red-400"/>

                            Mark as Incomplete
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-green-400">
                            <Check className="h-4 w-4 text-green-400"/>
                            Mark as Complete
                        </div>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                    onClick={() => onDelete(goal.id)}
                >
                    Delete Goal
                </Button>
            </CardFooter>
        </Card>
    )
}