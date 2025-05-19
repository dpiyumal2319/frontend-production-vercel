"use client";

import {useEffect} from 'react';
import {motion} from "framer-motion";
import {Loader2} from "lucide-react"; // Changed icon to something more docs-related, or keep Loader2
import {BACKEND_BASE_URL} from "@/lib/const";

export default function DocsRedirectPage() { // Renamed component for clarity
    const swaggerDocsUrl = `${BACKEND_BASE_URL}/docs`; // Use the constant for the backend URL

    useEffect(() => {
        // Wait for a short period (e.g., 1.5 seconds) and then redirect
        const timer = setTimeout(() => {
            window.location.href = swaggerDocsUrl;
        }, 1500); // Adjust delay as needed

        // Cleanup function to clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [swaggerDocsUrl]); // Add swaggerDocsUrl to dependency array if it could change, though it's constant here

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background text-foreground">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="flex flex-col items-center gap-4 p-6 rounded-lg shadow-xl bg-card" // Added some card styling
            >
                <motion.div
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {/* You can use Loader2 or a more specific icon like BookOpenCheck */}
                    <Loader2 className="h-12 w-12 text-primary"/>
                    {/* <BookOpenCheck className="h-12 w-12 text-primary" /> */}
                </motion.div>
                <motion.h1
                    className="text-2xl font-bold text-primary"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.2, duration: 0.5}}
                >
                    Redirecting to API Docs
                </motion.h1>
                <motion.p
                    className="text-muted-foreground text-center"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.4, duration: 0.5}}
                >
                    Please wait while we take you to the Swagger UI for our API.
                </motion.p>
                <motion.a
                    href={swaggerDocsUrl}
                    className="text-sm text-accent-foreground hover:underline mt-2"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.6, duration: 0.5}}
                >
                    Click here if you are not redirected automatically.
                </motion.a>
            </motion.div>
        </div>
    );
}
