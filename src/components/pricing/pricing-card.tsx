import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Leaf, TreeDeciduous, Sprout, Bell, LucideIcon } from 'lucide-react';
import Link from "next/link";

interface Feature {
  text: string;
  included: boolean; // Not strictly needed for the image, but good practice
}

interface PricingPlan {
  name: string;
  icon: string; // e.g., 'Leaf', 'Tree', 'Plant', 'Bell' or Lucide icon name
  tag: string | null; // e.g., 'Most Popular'
  description: string;
  price: number;
  priceDetails: string; // e.g., "per month"
  buttonText: string;
  buttonVariant: 'default' | 'outline'; // For Custom plan's dark button
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    icon: 'Leaf',
    tag: null,
    description: 'Ideal for Tracking a Small brand or Business',
    price: 0,
    priceDetails: 'per month',
    buttonText: 'Get started for free',
    buttonVariant: 'outline',
    features: ['1 User', 'Update in every 48h', 'AI Sentiments Analysis'],
  },
  {
    name: 'Team',
    icon: 'Tree',
    tag: null,
    description: 'Ideal for Tracking a Growing Brand or Business',
    price: 99,
    priceDetails: 'per month',
    buttonText: 'Purchase Now',
    buttonVariant: 'outline',
    features: ['2 Users', 'Update in every 24h', 'Competitive Analysis'],
  },
  {
    name: 'Pro',
    icon: 'Plant',
    tag: null,
    description: 'Ideal for Tracking a Large Brand or Business',
    price: 399,
    priceDetails: 'per month',
    buttonText: 'Purchase Now',
    buttonVariant: 'outline',
    features: ['5 Users', 'Update in every 12h', 'User Satisfaction Survey'],
  },
  {
    name: 'Custom',
    icon: 'Bell',
    tag: 'Most Popular',
    description: 'Ideal for Tracking a Global Brand or Business',
    price: 799,
    priceDetails: 'per month',
    buttonText: 'Purchase Plan',
    buttonVariant: 'default', // The dark button in your image
    features: ['Custom Users', 'Sales Growth Forecasts', 'Product Usage Analytics'],
  },
];
// Map your string icons to actual Lucide components
const IconMap: Record<string, LucideIcon> = {
  Leaf: Leaf,
  Tree: TreeDeciduous,
  Plant: Sprout,
  Bell: Bell,
};

interface PricingCardProps {
  plan: PricingPlan;
  isPopular: boolean;
}

export function PricingCard({ plan, isPopular }: PricingCardProps) {
  const Icon = IconMap[plan.icon] || Leaf;
  
  // Custom styling for the "Custom" (Most Popular) card to match the image
  const cardClassName = isPopular 
    ? "border-primary dark:border-primary-foreground shadow-lg dark:shadow-primary/50" 
    : "border-border";

  return (
    <Card className={`flex flex-col h-full ${cardClassName}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 -mt-3 mr-4">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-primary/10">
            {plan.tag}
          </span>
        </div>
      )}
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="text-5xl font-extrabold mt-4 whitespace-nowrap">
          ₹{plan.price}
          <span className="text-base font-normal text-muted-foreground ml-2">{plan.priceDetails}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm font-medium">{feature}</p>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full text-base py-6 ${plan.buttonVariant === 'default' ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : ''}`}
          variant={plan.buttonVariant === 'default' ? 'default' : 'outline'}
        >
          <Link href={`/checkout/${plan.name.toLowerCase()}`}>{plan.buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}