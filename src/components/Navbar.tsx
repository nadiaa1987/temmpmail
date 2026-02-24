"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { LogOut, LayoutDashboard, User, ShieldCheck } from "lucide-react";

export function Navbar() {
    const [user] = useAuthState(auth);
    const pathname = usePathname();

    const isDashboard = pathname.startsWith("/dashboard");
    const isAdmin = pathname.startsWith("/admin");

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-lg">TM</span>
                    <span>Temp<span className="text-violet-500">Mail</span></span>
                </Link>

                <div className="flex items-center gap-4">
                    {!user ? (
                        <Link
                            href="/dashboard"
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium transition-transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 text-sm font-medium ${isDashboard ? "text-primary" : "text-muted-foreground"}`}
                            >
                                <LayoutDashboard size={18} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>

                            {/* This would be conditionally shown if admin */}
                            <Link
                                href="/admin"
                                className={`flex items-center gap-2 text-sm font-medium ${isAdmin ? "text-primary" : "text-muted-foreground"}`}
                            >
                                <ShieldCheck size={18} />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>

                            <button
                                onClick={() => auth.signOut()}
                                className="flex items-center gap-2 text-sm font-medium text-destructive"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
