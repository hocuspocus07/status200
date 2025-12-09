import { PricingCard,pricingPlans } from "@/components/pricing/pricing-card";
import { Navigation } from "@/components/landing/navigation";

export default function PricingPage() {
  return (
    <main className="h-screen w-screen items-center justify-center flex">
          <Navigation />
    <div className="py-12 mt-32 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
            Find the Perfect Plan for Your Growth
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Choose a plan that scales with your brand, from small businesses to global enterprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, index) => (
            <div key={plan.name} className="relative">
              <PricingCard 
                plan={plan} 
                isPopular={plan.name === 'Custom'} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    </main>
  );
}