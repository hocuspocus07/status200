'use client';

import type { ReactNode } from "react"
import { useState, useEffect } from 'react'; 
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { NavigationBot } from "@/components/dashboard/navigation-bot"
import PremiumAdModal from "@/components/landing/premium-ad-modal" 

interface TokenPayload {
    id: string;
    email: string;
    isPremium: boolean;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.user) {
                        setUser(data.user);
                    }
                } else {
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Failed to fetch user in layout:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="flex h-screen flex-col lg:flex-row">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader />
                    <main className="flex-1 overflow-auto">
                        <PremiumAdModal isUserPremium={!!user?.isPremium} /> 
                        {children}
                    </main>
                </div>
            </div>
            <NavigationBot/>
        </div>
    )
}