"use client"

import type React from "react"
import {useState, useRef, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {MessageCircle, X, Send, Bot, User} from "lucide-react"
import {Avatar} from "@/components/ui/avatar"
import MarkdownRenderer from "@/app/(dashboard)/dashboard/budget/_components/markdown_renderer"
import {chat} from "@/lib/budget-lib/budget_api"

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content: "Hi there! I'm your financial assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const toggleChat = () => {
        setIsOpen(!isOpen)
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMessage = {
            role: "user",
            content: input,
            timestamp: new Date(),
        }
        setMessages([...messages, userMessage])
        setInput("")

        try {
            const response = await chat(input)

            const botMessage = {
                role: "bot",
                content: response.response,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error('Error fetching bot response:', error)
            const botMessage = {
                role: "bot",
                content: "Sorry, I encountered an error while processing your request.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])

    return (
        <>
            {/* Floating button */}
            <Button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all duration-200 ${isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                }`}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-primary-foreground"/>
                ) : (
                    <MessageCircle className="h-6 w-6 text-primary-foreground"/>
                )}
            </Button>

            {/* Chat window */}
            {isOpen && (
                <Card
                    className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] flex flex-col shadow-xl border border-border bg-card">
                    <CardHeader className="bg-secondary py-3 border-b border-border">
                        <CardTitle className="text-lg flex items-center text-secondary-foreground">
                            <Bot className="mr-2 h-5 w-5"/>
                            Financial Assistant
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div key={index}
                                 className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className="flex items-start max-w-[80%]">
                                    {message.role === "bot" && (
                                        <Avatar className="h-8 w-8 mr-2">
                                            <Bot className="h-8 w-8 text-secondary-foreground"/>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`rounded-lg px-4 py-2 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground border border-border"
                                        }`}
                                    >
                                        <MarkdownRenderer content={message.content}/>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8 ml-2">
                                            <User className="h-8 w-8 text-secondary-foreground"/>
                                        </Avatar>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </CardContent>
                    <CardFooter className="p-3 border-t border-border bg-secondary">
                        <div className="flex w-full items-center space-x-2">
                            <Input
                                type="text"
                                placeholder="Ask something about your finances..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 bg-background border-border focus:ring-ring placeholder:text-muted-foreground text-foreground"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!input.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Send className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </>
    )
}