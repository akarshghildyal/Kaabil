import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Building2, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">VirtualBank</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Your Virtual Bank Branch Manager</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience seamless banking with our AI-powered virtual branch manager. Apply for loans, verify
                documents, and get instant decisions.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card>
                <CardHeader>
                  <CardTitle>Talk to Branch Manager</CardTitle>
                  <CardDescription>
                    Interact with our AI branch manager for general queries and assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <Shield className="h-16 w-16 text-primary/30" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Try Now</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Check for Loan</CardTitle>
                  <CardDescription>Apply for loans and get instant eligibility checks and decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <Shield className="h-16 w-16 text-primary/30" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Apply Now</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Registration</CardTitle>
                  <CardDescription>Register your documents and face for faster future transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    <Shield className="h-16 w-16 text-primary/30" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">Register Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">VirtualBank</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VirtualBank. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

