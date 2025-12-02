"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-32 pb-16">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Powered by AI</span>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Take Notes Smarter,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Not Harder
          </span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
          Transform your thoughts into organized notes instantly. AI-powered note-taking
          that understands context, summarizes content, and helps you stay productive.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild className="group">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
        <div className="mt-16 rounded-lg border bg-muted/50 p-8">
          <p className="text-sm text-muted-foreground">
            Join thousands of users who are already taking smarter notes
          </p>
        </div>
      </div>
    </section>
  )
}

