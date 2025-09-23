"use client"

import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  "Aggregate credentials from 500+ providers",
  "NCVET-compliant validation system",
  "Employer-friendly verification portal",
  "Multilingual accessibility support",
]

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10"></div>
          <div className="relative p-8 sm:p-12 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
                Ready to Build Your Credential Portfolio?
              </h2>

              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Join thousands of learners who are already showcasing their skills with verified micro-credentials.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
