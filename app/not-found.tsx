"use client"

import Link from "next/link"
import { Suspense } from "react"

function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
      >
        Return to Home
      </Link>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense>
      <NotFoundContent />
    </Suspense>
  )
}