import { DotPattern } from "@/components/magicui/dot-pattern";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

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
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-40 px-4">
          <DotPattern
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] -z-50 bg-primary/20"
            )}
          />
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Your Virtual Bank Branch Manager
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience seamless banking with our AI-powered virtual branch
                manager. Apply for loans, verify documents, and get instant
                decisions.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span>
                Built by{" "}
                <span
                  className="font-bold text-base text-primary"
                  style={{ fontFamily: "monospace" }}
                >
                  Team OneStack
                </span>
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VirtualBank. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
