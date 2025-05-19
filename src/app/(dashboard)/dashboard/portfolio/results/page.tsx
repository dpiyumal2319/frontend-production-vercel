"use client";

import {useSearchParams} from "next/navigation";
import {motion} from "framer-motion";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {OptimizedPortfolioResult} from "@/lib/types/profile";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as TooltipComponent,
    ResponsiveContainer,
} from "recharts";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {
    ArrowUpRight,
    TrendingUp,
    AlertTriangle,
    Target,
    PieChart as PieChartIcon,
} from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import PortfolioExplanation from "@/components/portfolio/PortfolioExplanation";

export default function PortfolioResultsPage() {
    const searchParams = useSearchParams();
    const encodedData = searchParams.get("data");

    if (!encodedData) {
        return <p>No result data found.</p>;
    }

    try {
        const result = JSON.parse(encodedData) as OptimizedPortfolioResult;

        // Prepare data for pie chart
        const pieData = Object.entries(result.optimal_weights)
            .map(([name, value]) => ({
                name,
                value: Number(value) * 100,
            }))
            .filter((item) => item.value > 0);

        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

        const containerVariants = {
            hidden: {opacity: 0, y: 20},
            visible: {opacity: 1, y: 0},
        };
        console.log(result.method_used);

        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/global-assets/lookup">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/portfolio">
                                Portfolio
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#" className="text-foreground font-medium">
                                Results
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    transition={{duration: 0.5}}
                >
                    <h1 className="text-3xl font-bold mb-6">
                        Portfolio Optimization Results
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Portfolio Allocation Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5"/>
                                    Portfolio Allocation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <TooltipComponent/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {pieData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                }}
                                            />
                                            <span>
                                                {entry.name}: {entry.value.toFixed(2)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5"/>
                                    Key Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Expected Return
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">
                                                {(result.expected_return * 100).toFixed(2)}%
                                            </span>
                                            <ArrowUpRight className="text-green-500"/>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Volatility</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">
                                                {(result.volatility * 100).toFixed(2)}%
                                            </span>
                                            <AlertTriangle className="text-yellow-500"/>
                                        </div>
                                    </div>
                                </div>
                                <Separator/>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                                    <span className="text-2xl font-bold">
                                        {result.sharpe_ratio.toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Investment Goal
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5"/>
                                        <span className="text-lg">{result.goal}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Optimization Method
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{result.method_used}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monte Carlo Projection */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Monte Carlo Projection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Expected Final Value
                                        </p>
                                        <span className="text-2xl font-bold">
                                            $
                                            {result.monte_carlo_projection.expected_final_value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Minimum Final Value
                                        </p>
                                        <span className="text-2xl font-bold">
                                            $
                                            {result.monte_carlo_projection.min_final_value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Maximum Final Value
                                        </p>
                                        <span className="text-2xl font-bold">
                                            $
                                            {result.monte_carlo_projection.max_final_value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Success Rate
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">
                                                {result.monte_carlo_projection.success_rate_percent.toFixed(
                                                    2
                                                )}
                                                %
                                            </span>
                                            <Badge
                                                variant={
                                                    result.monte_carlo_projection.success_rate_percent >
                                                    80
                                                        ? "success"
                                                        : result.monte_carlo_projection
                                                            .success_rate_percent > 50
                                                            ? "default"
                                                            : "destructive"
                                                }
                                            >
                                                {result.monte_carlo_projection.success_rate_percent > 80
                                                    ? "High"
                                                    : result.monte_carlo_projection.success_rate_percent >
                                                    50
                                                        ? "Medium"
                                                        : "Low"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
                <div>
                    <PortfolioExplanation portfolioData={result}/>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error parsing result:", error);
        return <p>Error parsing result data.</p>;
    }
}
