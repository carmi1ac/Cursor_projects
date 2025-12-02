"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does AI note-taking work?",
    answer:
      "Our AI analyzes your notes in real-time, extracting key concepts, generating summaries, and organizing content automatically. It understands context and helps you find information faster.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, absolutely. All your notes are encrypted end-to-end and stored securely. We never access your content, and your privacy is our top priority.",
  },
  {
    question: "Can I use it offline?",
    answer:
      "Yes! You can create and edit notes offline. Once you're back online, everything syncs automatically across all your devices.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "AI Note Taker works on web, iOS, and Android. Your notes sync seamlessly across all platforms in real-time.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer a free plan with basic features. Premium plans start at $9.99/month with advanced AI features, unlimited storage, and priority support.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Yes, you can export your notes in multiple formats including Markdown, PDF, and plain text. Your data is always yours.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about AI Note Taker
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

