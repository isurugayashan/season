"use client"

import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <SignedOut>
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bus Season Check System</h1>
            <p className="text-gray-600 mb-8">Manage passenger bus seasons and team members</p>
            <div className="flex gap-4 justify-center">
              <SignInButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline">Sign Up</Button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Bus Season System</h1>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </SignedIn>
      </div>
  )
}
