'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from 'lucide-react';

interface PremiumAdModalProps {
    isUserPremium: boolean;
}

const PREMIUM_FEATURES = [
    "🚫 Ad-Free Experience",
    "⚡ Full Access to All Tools",
    "⚙️ Priority Support",
    "☁️ Unlimited Storage",
];

export default function PremiumAdModal({ isUserPremium }: PremiumAdModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isUserPremium) {
            setIsOpen(false);
            return;
        }

        let intervalId: NodeJS.Timeout;

        const showModal = () => {
            setIsOpen(true);
        };

        intervalId = setInterval(showModal, 20000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isUserPremium]); 

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleUpgrade = useCallback(() => {
        setIsOpen(false);
        window.location.href = '/checkout/pro';
    }, []);

    if (isUserPremium) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] p-6 bg-white dark:bg-gray-900 border-2 border-purple-500 shadow-xl">
                <DialogHeader className="relative pb-4">
                    <DialogTitle className="text-3xl font-extrabold text-purple-600 flex items-center justify-center gap-2">
                        ✨ Go Premium!
                    </DialogTitle>
                    <DialogDescription className="text-center text-md mt-1">
                        Unlock a seamless, ad-free experience.
                    </DialogDescription>
                    {/* Custom Cross Button */}
                    <Button
                        variant="ghost"
                        className="absolute right-0 top-0 h-6 w-6 p-0 rounded-full text-gray-500 hover:text-gray-900"
                        onClick={handleClose}
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogHeader>

                {/* Feature List */}
                <div className="space-y-3 py-2">
                    {PREMIUM_FEATURES.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <Button 
                    className="w-full text-lg py-6 bg-purple-600 hover:bg-purple-700 transition"
                    onClick={handleUpgrade}
                >
                    Upgrade Now for Only $399/mo
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-2">
                    Cancel anytime. Stop the interruptions today.
                </p>
            </DialogContent>
        </Dialog>
    );
}