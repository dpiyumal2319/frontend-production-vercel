'use client';

import React, {useState, useEffect, useMemo} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Brain, Layers, LineChart, Activity} from 'lucide-react';

const PredictionLoading = () => {
    const [dots, setDots] = useState('');
    const [modelText, setModelText] = useState('Initializing LSTM model');
    const [activeIcon, setActiveIcon] = useState(0);

    // Using useMemo to prevent the array from being recreated on each render
    const modelSteps = useMemo(() => [
        'Initializing LSTM model',
        'Processing historical data',
        'Training neural network',
        'Optimizing model weights',
        'Fine-tuning predictions'
    ], []);

    // Using useMemo for the icons array as well to maintain consistency
    const icons = useMemo(() => [
        <Brain key="brain" size={48} className="text-blue-600 dark:text-blue-400"/>,
        <Activity key="activity" size={48} className="text-blue-600 dark:text-blue-400"/>,
        <Layers key="layers" size={48} className="text-blue-600 dark:text-blue-400"/>,
        <LineChart key="chart" size={48} className="text-blue-600 dark:text-blue-400"/>
    ], []);

    // Animate the dots
    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        return () => clearInterval(dotInterval);
    }, []);

    // Cycle through the model training steps
    useEffect(() => {
        const stepInterval = setInterval(() => {
            setModelText(prev => {
                const currentIndex = modelSteps.indexOf(prev);
                const nextIndex = (currentIndex + 1) % modelSteps.length;
                setActiveIcon(nextIndex % icons.length);
                return modelSteps[nextIndex];
            });
        }, 4000);

        return () => clearInterval(stepInterval);
    }, [modelSteps, icons]);

    return (
        <div className="mb-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Prediction Model</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                                Training in progress
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 dark:border-blue-800/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">LSTM Neural Network Training</CardTitle>
                    <CardDescription>
                        Creating predictive model for stock market analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Neural network animation */}
                            <div
                                className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800/50 opacity-20 animate-ping"></div>
                            <div
                                className="absolute inset-2 rounded-full border-4 border-blue-300 dark:border-blue-700/50 opacity-40 animate-pulse"></div>
                            <div className="animate-pulse">
                                {icons[activeIcon]}
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-blue-700 dark:text-blue-400 font-mono min-h-6">
                                {modelText}{dots}
                            </p>
                            <div className="flex justify-center space-x-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <div
                                        key={index}
                                        className={`h-2 w-2 rounded-full ${
                                            index <= activeIcon % 4
                                                ? 'bg-blue-600 dark:bg-blue-400'
                                                : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md px-4">
                                Our LSTM (Long Short-Term Memory) model is analyzing historical market patterns
                                to generate accurate predictions. This process typically takes several
                                hours to complete for optimal results.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/30">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <h3 className="font-medium">What is LSTM?</h3>
                            <p className="text-sm text-muted-foreground">
                                LSTM (Long Short-Term Memory) is a specialized neural network
                                architecture designed to recognize patterns in sequential data,
                                making it ideal for stock market prediction.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/30">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <h3 className="font-medium">What happens during training?</h3>
                            <p className="text-sm text-muted-foreground">
                                Our model analyzes historical price data, trading volumes, and market patterns
                                to identify complex relationships that help predict future price movements.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PredictionLoading;

