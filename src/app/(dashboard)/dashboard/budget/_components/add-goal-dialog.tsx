"use client"

import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {createBudgetGoal} from "@/lib/budget-lib/budget_api"
import React, {useState} from "react"

interface AddGoalDialogProps {
    userId: string,
    goal: {
        description: string,
        amount: number,
        time_period: string
    }
}

export function AddGoalDialog({userId, goal}: AddGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const calculateDeadline = (timePeriod: string): string => {
        const now = new Date()
        switch (timePeriod) {
            case "daily":
                now.setDate(now.getDate() + 1)
                break
            case "weekly":
                now.setDate(now.getDate() + 7)
                break
            case "monthly":
                now.setMonth(now.getMonth() + 1)
                break
            case "yearly":
                now.setFullYear(now.getFullYear() + 1)
                break
            default:
                now.setMonth(now.getMonth() + 1)
        }
        return now.toISOString()
    }

    const [formData, setFormData] = useState({
        title: goal.description,
        category: "",
        deadline: calculateDeadline(goal.time_period),
        amount: goal.amount,
        time_period: "monthly"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const goalData = {
                user_id: userId,
                title: "FALSE:" + formData.title,
                category: formData.category,
                amount: formData.amount,
                created_at: new Date().toISOString(),
                deadline: calculateDeadline(formData.time_period)
            }

            await createBudgetGoal(goalData)
            console.log("Goal created successfully")
            setOpen(false)
            // You might want to add a way to refresh the goals list here
        } catch (error) {
            console.error("Error creating goal:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Goal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Budget Goal</DialogTitle>
                        <DialogDescription>
                            Set a new financial target to work towards.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="col-span-3 "
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="col-span-3 "
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                                className="col-span-3 "
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time_period" className="text-right">
                                Time Period
                            </Label>
                            <Select
                                value={formData.time_period}
                                onValueChange={(value) => setFormData({...formData, time_period: value})}
                            >
                                <SelectTrigger className="col-span-3 ">
                                    <SelectValue placeholder="Select time period"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}