import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, CreditCard, FileText, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to VirtualBank</h1>
        <p className="text-muted-foreground mt-2">
          Manage your banking needs with our AI-powered virtual branch manager
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Talk to Branch Manager
            </CardTitle>
            <CardDescription>Get assistance with general banking queries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Speak with our AI branch manager for help with account information, services, and general inquiries.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/talk-to-manager">
                Start Conversation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Check for Loan
            </CardTitle>
            <CardDescription>Apply for loans and get instant decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Apply for personal, home, or business loans with our AI-powered eligibility checker and get instant
              decisions.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/check-loan">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Document Registration
            </CardTitle>
            <CardDescription>Register your documents for faster processing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and register your identity and income documents for faster loan processing and verification.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/document-registration">
                Register Documents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent banking activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Account Registration</p>
                  <p className="text-sm text-muted-foreground">Account successfully created</p>
                </div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground italic">No other recent activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

