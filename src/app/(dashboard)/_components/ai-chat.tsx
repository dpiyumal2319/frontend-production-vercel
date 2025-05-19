"use client"

import type React from "react"
import {useState, useRef, useEffect, KeyboardEvent} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {MessageCircle, X, Send, Bot, User} from "lucide-react"
import {Avatar} from "@/components/ui/avatar"
import MarkdownRenderer from "@/app/(dashboard)/dashboard/budget/_components/markdown_renderer"
import {chat} from "@/lib/budget-lib/budget_api"
import {motion, AnimatePresence} from "framer-motion"

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
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const toggleChat = () => {
        setIsOpen(!isOpen)
        // Focus input when opening
        if (!isOpen) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 300) // Delay to wait for animation
        }
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
        setIsTyping(true)

        try {
            const response = await chat(input)

            setIsTyping(false)
            const botMessage = {
                role: "bot",
                content: response.response,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error('Error fetching bot response:', error)
            setIsTyping(false)
            const botMessage = {
                role: "bot",
                content: "Sorry, I encountered an error while processing your request.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botMessage])
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, isTyping])

    return (
        <>
            {/* Floating button with animation */}
            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{type: "spring", stiffness: 260, damping: 20}}
                className="fixed bottom-6 right-6 z-50"
            >
                <Button
                    onClick={toggleChat}
                    className={`rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all duration-300 ${
                        isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                    }`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={isOpen ? "close" : "open"}
                            initial={{rotate: -180, opacity: 0}}
                            animate={{rotate: 0, opacity: 1}}
                            exit={{rotate: 180, opacity: 0}}
                            transition={{duration: 0.2}}
                        >
                            {isOpen ? (
                                <X className="h-6 w-6 text-primary-foreground"/>
                            ) : (
                                <MessageCircle className="h-6 w-6 text-primary-foreground"/>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Button>
            </motion.div>

            {/* Chat window with animations */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{opacity: 0, y: 20, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 20, scale: 0.95}}
                        transition={{duration: 0.2, ease: "easeOut"}}
                        className="fixed bottom-6 right-24 z-40"
                    >
                        <Card
                            className="w-80 md:w-96 h-[500px] flex flex-col shadow-xl overflow-hidden py-0">
                            <motion.div
                                initial={{y: -50}}
                                animate={{y: 0}}
                                transition={{delay: 0.1, duration: 0.3}}
                            >
                                <CardHeader className="bg-secondary py-3">
                                    <CardTitle className="text-lg flex items-center text-secondary-foreground">
                                        <div className="mr-2 relative">
                                            <Bot className="h-5 w-5"/>
                                            <span
                                                className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                                        </div>
                                        Financial Assistant
                                    </CardTitle>
                                </CardHeader>
                            </motion.div>

                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.05, duration: 0.3}}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className="flex items-start max-w-[80%]">
                                            {message.role === "bot" && (
                                                <Avatar className="h-8 w-8 bg-secondary border border-border mr-2 items-center justify-center">
                                                    <Bot className="h-5 w-5 text-secondary-foreground"/>
                                                </Avatar>
                                            )}
                                            <motion.div
                                                initial={{scale: 0.9}}
                                                animate={{scale: 1}}
                                                transition={{duration: 0.2}}
                                                className={`rounded-lg px-4 py-2 ${
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary text-secondary-foreground border border-border"
                                                }`}
                                            >
                                                <MarkdownRenderer content={message.content}/>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {message.timestamp.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </motion.div>
                                            {message.role === "user" && (
                                                <Avatar className="h-8 w-8 ml-2 bg-primary/20 border border-primary/30  items-center justify-center">
                                                    <User className="h-5 w-5 text-primary"/>
                                                </Avatar>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing indicator */}
                                <AnimatePresence>
                                    {isTyping && (
                                        <motion.div
                                            initial={{opacity: 0, y: 10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: 10}}
                                            transition={{duration: 0.3}}
                                            className="flex justify-start"
                                        >
                                            <div className="flex max-w-[80%]">
                                                <Avatar className="h-8 w-8 mr-2 bg-secondary border border-border  items-center justify-center">
                                                    <Bot className="h-5 w-5 text-secondary-foreground"/>
                                                </Avatar>
                                                <div
                                                    className="rounded-lg px-4 py-3 bg-secondary text-secondary-foreground border border-border">
                                                    <div className="flex space-x-1 items-center h-5">
                                                        <div className="typing-dot"></div>
                                                        <div className="typing-dot animation-delay-200"></div>
                                                        <div className="typing-dot animation-delay-400"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef}/>
                            </CardContent>

                            <motion.div
                                initial={{y: 50}}
                                animate={{y: 0}}
                                transition={{delay: 0.1, duration: 0.3}}
                            >
                                <CardFooter className="p-3 border-t border-border bg-secondary">
                                    <div className="flex w-full items-center space-x-2">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Ask something about your finances..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="flex-1 bg-background border-border focus:ring-ring focus-visible:ring-2 placeholder:text-muted-foreground text-foreground transition-all duration-200"
                                            disabled={isTyping}
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isTyping}
                                            className={`${
                                                input.trim() && !isTyping
                                                    ? "bg-primary hover:bg-primary/90"
                                                    : "bg-muted hover:bg-muted/90"
                                            } text-primary-foreground transition-all duration-200`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isTyping ? (
                                                    <motion.div
                                                        key="loading"
                                                        initial={{opacity: 0}}
                                                        animate={{opacity: 1}}
                                                        exit={{opacity: 0}}
                                                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                                    />
                                                ) : (
                                                    <motion.div
                                                        key="send"
                                                        initial={{opacity: 0}}
                                                        animate={{opacity: 1}}
                                                        exit={{opacity: 0}}
                                                    >
                                                        <Send className="h-4 w-4"/>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </motion.div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add CSS for the typing dots animation */}
            <style jsx global>{`
                @keyframes blink {
                    0% {
                        opacity: 0.3;
                        transform: translateY(0);
                    }
                    50% {
                        opacity: 1;
                        transform: translateY(-2px);
                    }
                    100% {
                        opacity: 0.3;
                        transform: translateY(0);
                    }
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: currentColor;
                    border-radius: 50%;
                    animation: blink 1s infinite;
                    opacity: 0.3;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
            `}</style>
        </>
    )
}