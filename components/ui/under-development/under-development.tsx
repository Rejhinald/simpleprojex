import { Construction } from "lucide-react"

export default function UnderDevelopmentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 text-center">
      <div className="animate-bounce mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 shadow-md">
        <Construction className="h-12 w-12 text-slate-700" />
      </div>

      <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Under Development</h1>

      <p className="mb-8 max-w-md text-lg text-slate-600">
        We're working hard to bring you something amazing. Please check back soon!
      </p>

      <div className="flex space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: "0ms" }}></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: "300ms" }}></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: "600ms" }}></div>
      </div>

      <footer className="absolute bottom-4 text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Simple Projex
      </footer>
    </div>
  )
}
