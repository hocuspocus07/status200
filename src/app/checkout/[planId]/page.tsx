'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check } from 'lucide-react';
import { Navigation } from '@/components/landing/navigation';
import { TokenPayload } from '@/lib/getUserFromToken';
import { useState, useEffect } from 'react';
// --- MOCK DATA SOURCE (Same as the pricing page for consistency) ---
interface PricingPlan {
    name: string;
    price: number;
    features: string[];
}

const mockPricingPlans: Record<string, PricingPlan> = {
    team: {
        name: 'Team',
        price: 99,
        features: ['2 Users', 'Update in every 24h', 'Competitive Analysis'],
    },
    pro: {
        name: 'Pro',
        price: 399,
        features: ['5 Users', 'Update in every 12h', 'User Satisfaction Survey'],
    },
    custom: {
        name: 'Custom',
        price: 799,
        features: ['Custom Users', 'Sales Growth Forecasts', 'Product Usage Analytics'],
    },
};
// -------------------------------------------------------------------

export default function CheckoutPage() {
    // 1. Get the planId from the dynamic route
    const params = useParams();
    const planId = Array.isArray(params.planId) ? params.planId[0] : params.planId;
    const [isSignedIn, setIsSignedIn] = useState(false);
    // 2. Look up the plan details
    const plan = planId ? mockPricingPlans[planId.toLowerCase()] : undefined;
    const [isProcessing, setIsProcessing] = useState(false);
    // Handle case where planId is invalid
    if (!plan) {
        return (
            <div className="container py-24 text-center">
                <h1 className="text-3xl font-bold">Plan Not Found</h1>
                <p className="text-muted-foreground mt-2">Invalid checkout URL. Please select a valid pricing plan.</p>
                <Button asChild className="mt-6">
                    <a href="/">Go to Pricing Page</a>
                </Button>
            </div>
        );
    }

    // Mock calculations
    const subtotal = plan.price;
    const taxRate = 0.05; // 5% mock tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const [user, setUser] = useState<TokenPayload | null>(null);
    // Replace the existing useEffect with this
useEffect(() => {
  const checkUserStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsSignedIn(false);
      setUser(null);
      return;
    }

    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setIsSignedIn(false);
        setUser(null);
        localStorage.removeItem("token");
        return;
      }

      const userData = await res.json();
      if (userData && userData.user) {
        setIsSignedIn(true);
        setUser(userData.user);
        console.log("Logged In User:", userData.user);
      } else {
        setIsSignedIn(false);
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setIsSignedIn(false);
      setUser(null);
    }
  };

  checkUserStatus();
}, []);

// Replace handlePayment with this
const handlePayment = async () => {
  // Quick token check first
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please sign in to complete your purchase.");
    return;
  }

  // If state missing, try to revalidate before failing
  if (!user || !isSignedIn) {
    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        alert("Please sign in to complete your purchase.");
        return;
      }
      const data = await res.json();
      if (!data || !data.user) {
        alert("Please sign in to complete your purchase.");
        return;
      }
      setIsSignedIn(true);
      setUser(data.user);
    } catch (err) {
      console.error("Revalidation error:", err);
      alert("Please sign in to complete your purchase.");
      return;
    }
  }

  setIsProcessing(true);

  try {
    const payload = {
    userId: user?.id,
    planId: planId,
    planName: plan.name,
    amount: total, 
};
    const response = await fetch("/api/users/upgrade-premium", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const respJson = await response.json();
      alert(`Payment processed successfully! Your subscription to the ${plan!.name} plan is now active.`);

      if (respJson && respJson.user) {
        setUser(respJson.user);
      } else {
        setUser(prev => (prev ? { ...prev, isPremium: true } : prev));
      }

      window.location.href = "/dashboard";
    } else {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      alert(`Payment failed. Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Payment network error:", error);
    alert("An unexpected network error occurred during payment.");
  } finally {
    setIsProcessing(false);
  }
};
    return (
        <div className="h-screen w-screen items-center justify-center flex flex-col py-12 md:py-16">
            <Navigation />
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center">
                Finalizing Your {plan.name} Plan
            </h1>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-12 gap-6">

                <div className='col-span-7'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>Enter your card details to complete your subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="card-name">Name on Card</Label>
                                <Input id="card-name" type="text" placeholder="John Doe" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <Input id="card-number" type="text" placeholder="XXXX XXXX XXXX XXXX" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                                    <Input id="expiry" type="text" placeholder="12/27" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" type="text" placeholder="123" required />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full text-lg py-6" onClick={() => handlePayment()}>
                                Pay ₹{total.toFixed(2)} Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* === Right Column: Order Summary (1/3 width on large screens) === */}
                <div className='col-span-5'>
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Plan Details */}
                            <div className="flex justify-between font-semibold text-lg">
                                <span>{plan.name} Plan</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (5%)</span>
                                    <span>+₹{tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-xl">
                                <span>Order Total</span>
                                <span className='ml-2'>₹{total.toFixed(2)}</span>
                            </div>

                            <Separator className="my-4" />

                            {/* Included Features */}
                            <p className="font-semibold text-sm mb-2">What&apos;s Included:</p>
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
