"use client"

import { ArrowRight, Shield, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powered by NCVET Standards
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight mb-6">
              Your Complete <span className="text-primary">Micro-Credential</span> Portfolio
            </h1>

            <p className="text-xl text-muted-foreground text-pretty leading-relaxed mb-8">
              Aggregate, validate, and showcase all your micro-credentials in one unified platform. Build a
              comprehensive skill profile that employers and institutions trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Start Building Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                View Demo
              </Button>
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <Card className="relative p-8 bg-card/50 backdrop-blur-sm border-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Credential Overview</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Verified</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Data Science Certificate</p>
                        <p className="text-sm text-muted-foreground">University of Technology</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Digital Marketing</p>
                        <p className="text-sm text-muted-foreground">SkillUp Academy</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <Zap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cloud Computing</p>
                        <p className="text-sm text-muted-foreground">TechCorp Training</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Credits</span>
                      <span className="font-semibold">24 NSQF Credits</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
