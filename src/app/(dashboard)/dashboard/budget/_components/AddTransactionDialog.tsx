"use client";

import React, {useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
// We will remove the Select components as per the request
// import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {createTransaction, categorizeTransaction, TransactionCreate} from "@/lib/budget-lib/budget_api";
import {useBalance} from "@/context/BalanceContext"; // Assuming BalanceContext.tsx is in the same directory or adjust path
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default CSS for react-toastify

interface AddTransactionDialogProps {
    userId: string;
}

// Helper to format date to YYYY-MM-DD for input type="date"
const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export function AddTransactionDialog({userId}: AddTransactionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {refetch: refetchBalance} = useBalance(); // Get refetch function from context

    const initialTransactionState: Omit<TransactionCreate, 'user_id' | 'category' | 'created_at'> & {
        category?: string,
        created_at?: string
    } = {
        date: formatDateForInput(new Date()), // Format date for input
        reason: "",
        amount: 0,
        type: "expense" // Default to expense
    };

    const [newTransaction, setNewTransaction] = useState(initialTransactionState);
    const [error, setError] = useState<string | null>(null);

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!newTransaction.reason || newTransaction.amount <= 0 || !newTransaction.date) {
            setError("Please fill all required fields and ensure amount is greater than 0.");
            toast.error("Please fill all required fields and ensure amount is greater than 0.");
            return;
        }

        const transactionToCreate: TransactionCreate = {
            ...newTransaction,
            user_id: userId,
            amount: Number(newTransaction.amount),
            // API expects date in 'YYYY-MM-DD HH:MM:SS' format or similar, ensure this matches your backend
            // Using ISOString and preparing it. Adjust if your backend needs a different exact format.
            date: new Date(newTransaction.date).toISOString().replace("T", " ").split(".")[0],
            created_at: new Date().toISOString().replace("T", " ").split(".")[0],
            type: newTransaction.type as "expense" | "income",
            category: "", // Will be set by categorizeTransaction
        };

        const promise = async () => {
            // Step 1: Categorize transaction
            const categoryReceived = await categorizeTransaction(
                transactionToCreate.reason,
                transactionToCreate.amount,
                transactionToCreate.type
            );
            transactionToCreate.category = categoryReceived.category;

            // Step 2: Create transaction
            await createTransaction(transactionToCreate);

            // Step 3: Refetch balance
            refetchBalance(); // Use await if refetchBalance returns a promise and you need to wait

            // Step 4: Reset form and close dialog on success
            setNewTransaction(initialTransactionState);
            setIsOpen(false);
        };

        toast.promise(
            promise(),
            {
                pending: 'Adding transaction...',
                success: 'Transaction added successfully! 🎉',
                error: 'Failed to add transaction. Please try again. 🤯'
            }
        ).catch(err => {
            // The promise itself might reject, or an error within it.
            // toast.promise handles errors from the promise, but you can log them too.
            console.error("Transaction creation failed:", err);
            // setError("Failed to create transaction"); // This could be displayed in the form if needed
        });
    };

    // Handle changes to form inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    // Handle type selection (Expense/Income)
    const handleTypeSelect = (type: "expense" | "income") => {
        setNewTransaction(prev => ({...prev, type}));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-primary">Add New Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-6 p-2">
                    {/* Transaction Type Tabs */}
                    <div>
                        <Label className="mb-2 block text-sm font-medium text-foreground">Type</Label>
                        <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
                            <Button
                                type="button"
                                onClick={() => handleTypeSelect("expense")}
                                className={`w-full ${newTransaction.type === "expense"
                                    ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-700 dark:hover:bg-red-800"
                                    : "bg-transparent hover:bg-muted-foreground/20 text-foreground"
                                } transition-colors duration-150 py-2 px-4 rounded-md text-sm font-medium`}
                            >
                                Expense
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleTypeSelect("income")}
                                className={`w-full ${newTransaction.type === "income"
                                    ? "bg-green-500 hover:bg-green-600 text-white dark:bg-green-700 dark:hover:bg-green-800"
                                    : "bg-transparent hover:bg-muted-foreground/20 text-foreground"
                                } transition-colors duration-150 py-2 px-4 rounded-md text-sm font-medium`}
                            >
                                Income
                            </Button>
                        </div>
                    </div>

                    {/* Date Input */}
                    <div>
                        <Label htmlFor="date" className="mb-2 block text-sm font-medium text-foreground">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={newTransaction.date}
                            onChange={handleChange}
                            className="w-full bg-input border-border text-foreground rounded-md focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Amount Input */}
                    <div>
                        <Label htmlFor="amount"
                               className="mb-2 block text-sm font-medium text-foreground">Amount</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            min="0.01" // Ensure amount is positive
                            step="0.01"
                            value={newTransaction.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full bg-input border-border text-foreground rounded-md focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <Label htmlFor="reason"
                               className="mb-2 block text-sm font-medium text-foreground">Description</Label>
                        <Input
                            id="reason"
                            name="reason"
                            value={newTransaction.reason}
                            onChange={handleChange}
                            placeholder="e.g., Groceries, Salary"
                            className="w-full bg-input border-border text-foreground rounded-md focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {/* Error Message Display */}
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

                    {/* Submit Button */}
                    <Button type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-md transition-colors duration-150">
                        Add Transaction
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
