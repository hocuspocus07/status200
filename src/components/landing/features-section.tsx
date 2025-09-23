"use client"

import { Database, Shield, Users, Layers, Globe, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Database,
    title: "Unified Aggregation",
    description:
      "Collect and integrate micro-credentials from multiple training providers, universities, and online platforms in one place.",
  },
  {
    icon: Shield,
    title: "Trusted Validation",
    description: "Verify credentials through NCVET-recognized bodies and blockchain-based verification systems.",
  },
  {
    icon: Layers,
    title: "NSQF Alignment",
    description:
      "Map your credentials with National Skills Qualifications Framework levels for stackable qualifications.",
  },
  {
    icon: Users,
    title: "Employer Portal",
    description: "Enable employers and institutions to easily access and verify your complete skill profile.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Access the platform in multiple languages with inclusive and accessible features for diverse learners.",
  },
  {
    icon: Award,
    title: "Digital Portfolio",
    description: "Showcase your skills with a comprehensive digital portfolio that strengthens credential credibility.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Manage Your Credentials</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to collect, validate, and showcase your
            micro-credentials effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
