'use client';

import {AnomalyDetectionResponse} from '../_utils/definitions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Skeleton} from '@/components/ui/skeleton';
import {AlertCircle, AlertTriangle, Calendar, CircleAlert} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import RiskBadge from "@/app/(dashboard)/_components/RiskBadge";
import {motion} from 'framer-motion';
import {AnomalyGraph} from "@/app/(dashboard)/assets/[symbol]/_components/AnomalyGraph";

// Create motion variants of the components
const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

interface AnomalySectionProps {
    loading: boolean;
    error: string | null;
    anomalyRisk: AnomalyDetectionResponse | null;
}

const AnomalySection = ({
                            loading,
                            error,
                            anomalyRisk
                        }: AnomalySectionProps) => {

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSeverityBadge = (severity: number | null | undefined) => {
        if (!severity) return <Badge variant="outline">Unknown</Badge>;

        return <RiskBadge score={severity} showLabel={false}/>
    };

    const sortedFlags = anomalyRisk?.flags?.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateA.getTime() - dateB.getTime(); // Sort in ascending order
    });

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
        >
            <motion.h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                initial={{opacity: 0, y: -10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.4}}
            >
                <AlertTriangle size={18}/>
                Anomaly Detection
            </motion.h3>

            {error && (
                <motion.div
                    initial={{opacity: 0, scale: 0.95}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.3}}
                >
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {loading ? (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.4}}
                >
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-4 w-2/3"/>
                            <Skeleton className="h-3 w-1/2"/>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                                <Skeleton className="h-10 w-full"/>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : anomalyRisk ? (
                <MotionCard
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.4, delay: 0.2}}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Anomaly Findings</CardTitle>
                                {anomalyRisk.anomaly_score !== undefined && anomalyRisk.anomaly_score !== null && (
                                    <motion.div
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.3
                                        }}
                                    >
                                        <RiskBadge score={Number(anomalyRisk.anomaly_score.toFixed(1))}/>
                                    </motion.div>
                                )}
                            </div>
                            <CardDescription>
                                Unusual patterns or events that may indicate risk
                            </CardDescription>
                        </CardHeader>
                    </motion.div>
                    <CardContent>
                        {/* Move the graph outside the flags check so it shows regardless */}
                        {anomalyRisk?.historical_data && anomalyRisk.historical_data.length > 0 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{delay: 0.3, duration: 0.5}}
                            >
                                <AnomalyGraph
                                    historicalData={anomalyRisk.historical_data}
                                    flags={anomalyRisk.flags || []}
                                />
                            </motion.div>
                        )}

                        {anomalyRisk.flags && anomalyRisk.flags.length > 0 ? (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                transition={{delay: 0.3, duration: 0.5}}
                            >
                                <div className="mt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Severity</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedFlags !== undefined && sortedFlags.map((flag, idx) => (
                                                <MotionTableRow
                                                    key={idx}
                                                    initial={{opacity: 0, x: -20}}
                                                    animate={{opacity: 1, x: 0}}
                                                    transition={{delay: 0.4 + (idx * 0.1), duration: 0.3}}
                                                >
                                                    <TableCell className="font-medium">
                                                        {flag.type || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell className="flex items-center gap-1">
                                                        <Calendar size={14}/>
                                                        {flag.date ? formatDate(flag.date) : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>{flag.description || 'No description available'}</TableCell>
                                                    <TableCell>
                                                        <motion.div
                                                            initial={{scale: 0.8}}
                                                            animate={{scale: 1}}
                                                            transition={{delay: 0.5 + (idx * 0.1)}}
                                                        >
                                                            {getSeverityBadge(flag.severity)}
                                                        </motion.div>
                                                    </TableCell>
                                                </MotionTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="flex items-center justify-center p-6 text-center"
                                initial={{opacity: 0, scale: 0.9}}
                                animate={{opacity: 1, scale: 1}}
                                transition={{delay: 0.3, duration: 0.5}}
                            >
                                <div>
                                    <motion.div
                                        initial={{scale: 0, rotate: -90}}
                                        animate={{scale: 1, rotate: 0}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.4
                                        }}
                                    >
                                        <CircleAlert className="h-10 w-10 text-green-500 mx-auto mb-2"/>
                                    </motion.div>
                                    <motion.p
                                        className="text-muted-foreground"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        transition={{delay: 0.6}}
                                    >
                                        No anomalies detected in the analyzed period.
                                    </motion.p>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </MotionCard>
            ) : (
                <motion.div
                    className="flex items-center justify-center p-6 border rounded-md"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <p className="text-muted-foreground">No anomaly detection data available.</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AnomalySection;

