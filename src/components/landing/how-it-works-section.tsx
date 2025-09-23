"use client"

import { ArrowRight, Upload, CheckCircle, Share } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Connect Your Sources",
    description: "Link your accounts from universities, training providers, and online learning platforms.",
  },
  {
    icon: CheckCircle,
    title: "Automatic Validation",
    description: "Our system validates and verifies your credentials through trusted NCVET-recognized sources.",
  },
  {
    icon: Share,
    title: "Share Your Profile",
    description: "Present your unified credential portfolio to employers and institutions with confidence.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Get started with your credential aggregation in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-16 h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
