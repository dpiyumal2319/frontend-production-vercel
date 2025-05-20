// src/app/(auth)/logout/page.tsx
'use client';

import {useEffect} from 'react';
import {logout} from "@/actions/auth";
import {motion} from "framer-motion";
import {Loader2} from "lucide-react";

export default function LogoutPage() {
    useEffect(() => {
        localStorage.clear(); // Clear local storage

        // Wait 1 second and then call the logout function
        const timer = setTimeout(() => {
            logout().then(() => console.log("Logged out successfully"));
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="flex flex-col items-center gap-4"
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
                    <Loader2 className="h-12 w-12 text-primary"/>
                </motion.div>
                <motion.h1
                    className="text-2xl font-bold text-foreground"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.3}}
                >
                    Logging out...
                </motion.h1>
                <motion.p
                    className="text-muted-foreground"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.5}}
                >
                    Please wait while we securely log you out.
                </motion.p>
            </motion.div>
        </div>
    );
}