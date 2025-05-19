import {AppSidebar} from "@/app/(dashboard)/_components/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {SidebarInset, SidebarProvider, SidebarTrigger,} from "@/components/ui/sidebar"
import {LogOut} from "lucide-react"
import {ModeToggle} from "@/components/ThemeProvider";
import React, {Suspense} from "react";
import {SidebarSkeleton} from "@/app/(dashboard)/_components/sidebar-skeleton";
import Link from "next/link";
import HeaderSearchBar from "./_components/HeaderSearchBar";
import {BalanceProvider} from "@/context/BalanceContext";
import BalanceDisplay from "@/app/(dashboard)/_components/BalanceDisplay"; // Import the new component
import {AIChat} from "@/app/(dashboard)/_components/ai-chat";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    return (
        <BalanceProvider>
            <SidebarProvider className={'h-screen w-screen flex overscroll-auto'}>
                <Suspense fallback={<SidebarSkeleton/>}>
                    <AppSidebar/>
                </Suspense>
                <SidebarInset>
                    <header
                        className="flex h-16 items-center justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b-1 shadow-sm">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1"/>
                        </div>

                        {/* Search bar in the middle */}
                        <div className="flex-1 max-w-md px-4">
                            <HeaderSearchBar className="w-full"/>
                        </div>

                        <div className="flex items-center gap-4 px-4">
                            <BalanceDisplay/>
                            <Separator
                                orientation={"vertical"}
                                className="data-[orientation=vertical]:h-4"/>
                            <ModeToggle/>
                            <Separator
                                orientation="vertical"
                                className="data-[orientation=vertical]:h-4"/>
                            <Link href="/logout" passHref>
                                <button
                                    className={'cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 w-8 h-8 rounded-sm flex items-center justify-center transition-colors'}>
                                    <LogOut size={16}/>
                                </button>
                            </Link>
                        </div>
                    </header>
                    <div className="flex-1 overflow-auto">
                        {children}
                        {/*<footer>*/}
                        {/*    <Separator/>*/}
                        {/*    <div className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground">*/}
                        {/*        <span>© 2024 - Sem 4 Group J</span>*/}
                        {/*    </div>*/}
                        {/*</footer>*/}
                        <AIChat/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </BalanceProvider>
    )
}