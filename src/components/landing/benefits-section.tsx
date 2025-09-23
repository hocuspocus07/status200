"use client"

import { TrendingUp, Clock, Users, Shield } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    stat: "85%",
    label: "Increase in Job Opportunities",
    description: "Learners with verified credential portfolios see significantly more career opportunities.",
  },
  {
    icon: Clock,
    stat: "60%",
    label: "Faster Hiring Process",
    description: "Employers can verify skills instantly, reducing recruitment time and costs.",
  },
  {
    icon: Users,
    stat: "10K+",
    label: "Active Learners",
    description: "Join thousands of professionals building their credential portfolios.",
  },
  {
    icon: Shield,
    stat: "100%",
    label: "Verified Credentials",
    description: "All credentials are validated through NCVET-recognized verification systems.",
  },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Learners and Employers</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            See the impact of unified credential management on career growth and hiring efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>

              <div className="text-4xl font-bold text-primary mb-2">{benefit.stat}</div>
              <h3 className="text-lg font-semibold mb-3">{benefit.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
