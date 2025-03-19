import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function CheckLoanStatusPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Application Result</CardTitle>
        <CardDescription>
          Review the decision on your loan application
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600">
            Congratulations!
          </h2>
          <p className="text-lg">Your loan application has been approved.</p>
          <div className="bg-muted p-4 rounded-lg max-w-md mx-auto mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Type:</span>
                <span className="font-medium">Home Loan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount:</span>
                <span className="font-medium">₹5,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenure:</span>
                <span className="font-medium">20 months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium">10% p.a.</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            A representative will contact you shortly with further details.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Start New Application
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
