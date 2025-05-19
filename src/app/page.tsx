import React from 'react';
import {ModeToggle} from "@/components/ThemeProvider";
import {ArrowRight, LineChart, Shield, Target, Wallet, ArrowUpRight, LucideIcon} from 'lucide-react';
import {Button} from "@/components/ui/button";
import Link from "next/link";

const FeatureCard = ({icon, title, description, color}: {
    icon: LucideIcon,
    title: string,
    description: string,
    color: string
}) => {
    const Icon = icon;
    return (
        <div className="flex flex-col p-6 border rounded-lg bg-card hover:shadow-md transition-shadow duration-300">
            <div className={`p-3 w-12 h-12 rounded-full flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6 text-primary-foreground"/>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
};

const GroupSection = ({number, title, technologies, description}: {
    number: string;
    title: string;
    technologies: string[];
    description: string;
}) => (
    <div className="border border-border rounded-lg p-6 hover:border-primary/50 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-primary">Group {number}</span>
            <span
                className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent-foreground">Featured</span>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
            {technologies.map((tech, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
          {tech}
        </span>
            ))}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button variant="ghost" size="sm" className="mt-4 group">
            Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
        </Button>
    </div>
);

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Navigation Bar */}
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur w-full px-4">
                <div className="flex h-16 items-center justify-between w-full">
                    <Link href={'/'} className="flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-primary"/>
                        <span className="font-bold text-xl">IntelliFinance</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
                        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Groups</a>
                        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Technology</a>
                        <a href="#" className="text-sm font-medium hover:text-primary transition-colors">About</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle/>
                        <div className="hidden md:flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a href="/auth/login">Login</a>
                            </Button>
                            <Button size="sm" asChild>
                                <a href="/auth/register">Register</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 md:py-32 container px-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            Intelligent Advisor for <span className="text-primary">Personal Finance</span> & Investment
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            AI-powered financial planning and investment strategies tailored to your unique financial
                            goals and risk tolerance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link href="/auth/register">Get Started <ArrowUpRight className="ml-2 h-4 w-4"/></Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/global-assets/lookup">Demo Dashboard</Link>
                            </Button>
                        </div>
                    </div>
                    <div
                        className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-6 h-80 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <div
                                className="absolute top-4 left-4 w-40 h-24 bg-card rounded-lg shadow-lg p-4 border border-border">
                                <div className="w-full h-2 bg-primary/30 rounded mb-2"></div>
                                <div className="w-3/4 h-2 bg-primary/30 rounded mb-2"></div>
                                <div className="w-1/2 h-2 bg-primary/30 rounded"></div>
                            </div>
                            <div
                                className="absolute bottom-4 right-4 w-40 h-24 bg-card rounded-lg shadow-lg p-4 border border-border">
                                <div className="h-12 w-full bg-accent/20 rounded-md flex items-end">
                                    <div className="h-3/4 w-1/5 bg-accent rounded-sm mx-1"></div>
                                    <div className="h-1/2 w-1/5 bg-accent rounded-sm mx-1"></div>
                                    <div className="h-full w-1/5 bg-accent rounded-sm mx-1"></div>
                                    <div className="h-2/3 w-1/5 bg-accent rounded-sm mx-1"></div>
                                    <div className="h-1/3 w-1/5 bg-accent rounded-sm mx-1"></div>
                                </div>
                            </div>
                            <div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-card rounded-lg shadow-lg p-4 border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="flex items-end h-16">
                                    <div className="flex-1 h-4/5 bg-secondary/30 rounded-t-sm"></div>
                                    <div className="flex-1 h-1/2 bg-secondary/30 rounded-t-sm"></div>
                                    <div className="flex-1 h-full bg-primary rounded-t-sm"></div>
                                    <div className="flex-1 h-2/3 bg-secondary/30 rounded-t-sm"></div>
                                    <div className="flex-1 h-1/3 bg-secondary/30 rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-secondary/5 px-8">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Powerful Financial Intelligence</h2>
                        <p className="text-muted-foreground md:w-2/3 mx-auto">
                            Our platform combines machine learning, reinforcement learning, and financial expertise to
                            offer comprehensive solutions for your financial needs.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={LineChart}
                            title="Stock Prediction"
                            description="AI-powered forecasting using LSTM networks and real-time market data from Yahoo Finance API"
                            color="bg-primary"
                        />
                        <FeatureCard
                            icon={Wallet}
                            title="Smart Budgeting"
                            description="NLP-based expense categorization and automated budget optimization using machine learning"
                            color="bg-primary"
                        />
                        <FeatureCard
                            icon={Target}
                            title="Portfolio Optimization"
                            description="Personalized investment strategies using Monte Carlo simulations and Markowitz models"
                            color="bg-primary"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Risk Monitoring"
                            description="Fairness-aware AI with explainable models to ensure compliance and minimize financial risk"
                            color="bg-primary"
                        />
                    </div>
                </div>
            </section>

            {/* Groups Section */}
            <section className="py-16 container px-8">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">Project Groups</h2>
                    <p className="text-muted-foreground">
                        Our platform is built by four specialized teams focusing on different aspects of financial
                        intelligence.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <GroupSection
                        number="37"
                        title="Stock Market Prediction"
                        technologies={["LSTM", "Yahoo Finance API", "Python"]}
                        description="Advanced time-series forecasting for stock market movements using deep learning models trained on historical market data."
                    />
                    <GroupSection
                        number="38"
                        title="AI-Powered Budgeting & Expense Tracking"
                        technologies={["NLP", "Scikit-learn", "FastAPI"]}
                        description="Intelligent expense categorization and personalized budget recommendations based on spending patterns."
                    />
                    <GroupSection
                        number="39"
                        title="Personalized Investment Portfolio"
                        technologies={["Monte Carlo", "Markowitz Model", "React.js"]}
                        description="Optimized investment strategies tailored to individual risk profiles and financial goals."
                    />
                    <GroupSection
                        number="40"
                        title="Financial Risk & Compliance"
                        technologies={["Fairness-aware AI", "Explainability", "PostgreSQL"]}
                        description="Monitoring and mitigation of financial risks with transparent AI decision-making processes."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to transform your financial future?</h2>
                    <p className="text-muted-foreground md:w-2/3 mx-auto mb-8">
                        Join thousands of users who are already benefiting from our AI-powered financial advisor.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <a href="/auth/register">Create Account</a>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <a href="/login">Login</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t mt-auto">
                <div className="flex flex-col w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center px-4">
                        <Link href={'/'} className="flex items-center gap-2 mb-4 md:mb-0">
                            <Wallet className="h-6 w-6 text-primary"/>
                            <span className="font-bold text-xl">IntelliFinance</span>
                        </Link>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Use</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} IntelliFinance. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}