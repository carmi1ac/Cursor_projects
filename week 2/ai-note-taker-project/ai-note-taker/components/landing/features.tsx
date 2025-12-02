"use client"

import { Brain, Zap, Lock, Search, Share2, Sparkles } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Summarization",
    description:
      "Automatically summarize long notes and extract key insights using advanced AI technology.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Capture your thoughts instantly with real-time sync across all your devices.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find any note instantly with semantic search that understands context and meaning.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description:
      "Your notes are encrypted and stored securely. Your privacy is our top priority.",
  },
  {
    icon: Share2,
    title: "Easy Collaboration",
    description:
      "Share notes with your team and collaborate in real-time with seamless integration.",
  },
  {
    icon: Sparkles,
    title: "Smart Organization",
    description:
      "Automatically organize your notes with AI-powered tags and categories.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to take better notes
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make note-taking effortless and intelligent
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

