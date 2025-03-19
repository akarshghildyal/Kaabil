"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoanType = "personal" | "home" | "business";
type Step = "type" | "details" | "documents" | "result";

export default function CheckLoanPage() {
  const [step, setStep] = useState<Step>("type");
  const [loanType, setLoanType] = useState<LoanType>("personal");
  const [progress, setProgress] = useState(25);
  const [formData, setFormData] = useState({
    amount: "",
    tenure: "",
    income: "",
    employment: "salaried",
    purpose: "",
  });
  const [documents, setDocuments] = useState({
    identity: false,
    income: false,
    address: false,
  });
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, employment: value }));
  };

  const router = useRouter();

  const handleNext = () => {
    if (step === "type") {
      setStep("details");
      setProgress(50);
    } else if (step === "details") {
      setStep("documents");
      setProgress(100);
    } else if (step === "documents") {
      router.push("/dashboard/talk-to-manager?approved");
      setProgress(100);
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("type");
      setProgress(25);
    } else if (step === "documents") {
      setStep("details");
      setProgress(50);
    } else if (step === "result") {
      setStep("documents");
      setProgress(75);
    }
  };

  const handleDocumentUpload = (docType: keyof typeof documents) => {
    // Simulate document upload
    setTimeout(() => {
      setDocuments((prev) => ({ ...prev, [docType]: true }));
    }, 1000);
  };

  const resetApplication = () => {
    setStep("type");
    setProgress(25);
    setFormData({
      amount: "",
      tenure: "",
      income: "",
      employment: "salaried",
      purpose: "",
    });
    setDocuments({
      identity: false,
      income: false,
      address: false,
    });
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto min-h-screen flex flex-col justify-center items-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
        <p className="text-muted-foreground mt-2">
          Now approved and apply for a loan
        </p>
      </div>

      <div className="mb-8 w-full max-w-xl">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Loan Type</span>
          <span>Details</span>
          <span>Documents</span>
        </div>
      </div>

      {step === "type" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Loan Type</CardTitle>
            <CardDescription>
              Choose the type of loan you want to apply for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={loanType}
              onValueChange={(value) => setLoanType(value as LoanType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Loan</TabsTrigger>
                <TabsTrigger value="home">Home Loan</TabsTrigger>
                <TabsTrigger value="business">Business Loan</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Personal Loan Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Personal loans can be used for various purposes like medical
                    expenses, education, travel, or debt consolidation.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="font-medium">Features:</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Loan amount up to ₹20 lakhs</li>
                    <li>Tenure from 1 to 5 years</li>
                    <li>Interest rates starting from 10.5% p.a.</li>
                    <li>Minimal documentation required</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="home" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Home Loan Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Home loans can be used to purchase a new house, renovate an
                    existing property, or construct a house on a plot.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="font-medium">Features:</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Loan amount up to ₹5 crores</li>
                    <li>Tenure from 5 to 30 years</li>
                    <li>Interest rates starting from 7.5% p.a.</li>
                    <li>Property documents required</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="business" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Business Loan Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Business loans can be used for expanding your business,
                    purchasing equipment, or managing working capital.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="font-medium">Features:</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Loan amount up to ₹50 lakhs</li>
                    <li>Tenure from 1 to 7 years</li>
                    <li>Interest rates starting from 12% p.a.</li>
                    <li>Business documentation required</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled>
              Back
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>
              Provide details about your loan requirements and financial status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Loan Tenure (months)</Label>
                <Input
                  id="tenure"
                  name="tenure"
                  placeholder="Enter tenure"
                  value={formData.tenure}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income (₹)</Label>
              <Input
                id="income"
                name="income"
                placeholder="Enter monthly income"
                value={formData.income}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <RadioGroup
                value={formData.employment}
                onValueChange={handleRadioChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="salaried" id="salaried" />
                  <Label htmlFor="salaried">Salaried</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self-employed" id="self-employed" />
                  <Label htmlFor="self-employed">Self-employed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business-owner" />
                  <Label htmlFor="business-owner">Business Owner</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Loan Purpose</Label>
              <Input
                id="purpose"
                name="purpose"
                placeholder="Enter loan purpose"
                value={formData.purpose}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload the required documents for loan verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Identity Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Aadhaar Card or PAN Card
                    </p>
                  </div>
                </div>
                {documents.identity ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Uploaded
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentUpload("identity")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Income Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Salary slips or IT returns
                    </p>
                  </div>
                </div>
                {documents.income ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Uploaded
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentUpload("income")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Utility bill or Passport
                    </p>
                  </div>
                </div>
                {documents.address ? (
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    Uploaded
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentUpload("address")}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Note:</span> All documents should
                be clear and legible. Our AI system will verify these documents
                for loan processing.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                !documents.identity || !documents.income || !documents.address
              }
            >
              Submit Application
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
