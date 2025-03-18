"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Check, AlertCircle, Camera, RefreshCw, FileText, UserCheck } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type DocumentType = "identity" | "income" | "address" | "face"
type DocumentStatus = "idle" | "uploading" | "processing" | "success" | "error"

interface DocumentState {
  status: DocumentStatus
  file: File | null
  preview: string | null
  message: string | null
}

export default function DocumentRegistrationPage() {
  const [activeTab, setActiveTab] = useState<DocumentType>("identity")
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentState>>({
    identity: { status: "idle", file: null, preview: null, message: null },
    income: { status: "idle", file: null, preview: null, message: null },
    address: { status: "idle", file: null, preview: null, message: null },
    face: { status: "idle", file: null, preview: null, message: null },
  })
  const [showCamera, setShowCamera] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update document state
    setDocuments((prev) => ({
      ...prev,
      [activeTab]: {
        status: "uploading",
        file,
        preview: URL.createObjectURL(file),
        message: "Uploading document...",
      },
    }))

    // Simulate upload and processing
    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          status: "processing",
          message: "Processing document...",
        },
      }))

      // Simulate document verification
      setTimeout(() => {
        const success = Math.random() > 0.2 // 80% success rate for demo
        setDocuments((prev) => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            status: success ? "success" : "error",
            message: success
              ? "Document verified successfully!"
              : "Verification failed. Please try again with a clearer document.",
          },
        }))
      }, 2000)
    }, 1500)
  }

  const handleCameraCapture = () => {
    // Simulate camera capture
    setDocuments((prev) => ({
      ...prev,
      face: {
        status: "uploading",
        file: null,
        preview: "/placeholder.svg?height=300&width=300",
        message: "Uploading face image...",
      },
    }))

    // Simulate processing
    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        face: {
          ...prev.face,
          status: "processing",
          message: "Processing face image...",
        },
      }))

      // Simulate verification
      setTimeout(() => {
        setDocuments((prev) => ({
          ...prev,
          face: {
            ...prev.face,
            status: "success",
            message: "Face registered successfully!",
          },
        }))
      }, 2000)
    }, 1500)

    setShowCamera(false)
  }

  const resetDocument = (type: DocumentType) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: { status: "idle", file: null, preview: null, message: null },
    }))
  }

  const completeRegistration = () => {
    // Check if all documents are verified
    const allVerified = Object.values(documents).every((doc) => doc.status === "success")

    if (allVerified) {
      setRegistrationComplete(true)
    }
  }

  const getCompletionPercentage = () => {
    const totalDocs = Object.keys(documents).length
    const completedDocs = Object.values(documents).filter((doc) => doc.status === "success").length
    return (completedDocs / totalDocs) * 100
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Document Registration</h1>
        <p className="text-muted-foreground mt-2">Register your documents for faster loan processing</p>
      </div>

      {registrationComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Registration Complete</CardTitle>
            <CardDescription>All your documents have been successfully registered</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">All Set!</h2>
            <p className="text-center max-w-md mb-6">
              Your documents have been successfully registered and verified. You can now apply for loans with a faster
              approval process.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Card className="p-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-xs text-muted-foreground">3 verified</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Face ID</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
                </div>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setRegistrationComplete(false)}>Update Documents</Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="mb-8">
            <Progress value={getCompletionPercentage()} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{getCompletionPercentage()}% complete</p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="identity" className="relative">
                Identity
                {documents.identity.status === "success" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="income" className="relative">
                Income
                {documents.income.status === "success" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="address" className="relative">
                Address
                {documents.address.status === "success" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="face" className="relative">
                Face ID
                {documents.face.status === "success" && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity">
              <DocumentUploadCard
                title="Identity Proof"
                description="Upload your Aadhaar Card or PAN Card"
                status={documents.identity.status}
                preview={documents.identity.preview}
                message={documents.identity.message}
                onFileChange={handleFileChange}
                onReset={() => resetDocument("identity")}
                acceptedFormats=".jpg, .jpeg, .png, .pdf"
                helpText="Please ensure the document is clearly visible and all details are legible."
              />
            </TabsContent>

            <TabsContent value="income">
              <DocumentUploadCard
                title="Income Proof"
                description="Upload your salary slips or IT returns"
                status={documents.income.status}
                preview={documents.income.preview}
                message={documents.income.message}
                onFileChange={handleFileChange}
                onReset={() => resetDocument("income")}
                acceptedFormats=".jpg, .jpeg, .png, .pdf"
                helpText="Please upload the last 3 months of salary slips or the latest IT return."
              />
            </TabsContent>

            <TabsContent value="address">
              <DocumentUploadCard
                title="Address Proof"
                description="Upload your utility bill or passport"
                status={documents.address.status}
                preview={documents.address.preview}
                message={documents.address.message}
                onFileChange={handleFileChange}
                onReset={() => resetDocument("address")}
                acceptedFormats=".jpg, .jpeg, .png, .pdf"
                helpText="The address proof should be recent (not older than 3 months)."
              />
            </TabsContent>

            <TabsContent value="face">
              <Card>
                <CardHeader>
                  <CardTitle>Face Registration</CardTitle>
                  <CardDescription>Register your face for secure authentication</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.face.status === "idle" ? (
                    <div className="flex flex-col items-center py-8">
                      {showCamera ? (
                        <div className="space-y-6 w-full max-w-md">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                          <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={() => setShowCamera(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCameraCapture}>Capture</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-6">
                          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                            <Camera className="h-10 w-10 text-muted-foreground/50" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">Register Your Face</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Your face will be used for secure authentication when applying for loans or accessing your
                              account.
                            </p>
                          </div>
                          <Button onClick={() => setShowCamera(true)}>Start Face Registration</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="mb-6 relative">
                        {documents.face.preview && (
                          <img
                            src={documents.face.preview || "/placeholder.svg"}
                            alt="Face preview"
                            className="h-48 w-48 object-cover rounded-full"
                          />
                        )}
                        {documents.face.status === "success" && (
                          <div className="absolute -bottom-2 -right-2 bg-green-100 rounded-full p-1">
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`text-center mb-6 ${
                          documents.face.status === "success"
                            ? "text-green-600"
                            : documents.face.status === "error"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        <p>{documents.face.message}</p>
                      </div>

                      {documents.face.status === "success" || documents.face.status === "error" ? (
                        <Button variant="outline" onClick={() => resetDocument("face")}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="animate-pulse">●</span>
                          <span>
                            {documents.face.status === "uploading"
                              ? "Uploading..."
                              : documents.face.status === "processing"
                                ? "Processing..."
                                : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Your face data is securely stored and used only for authentication purposes.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end">
            <Button onClick={completeRegistration} disabled={getCompletionPercentage() < 100}>
              Complete Registration
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

interface DocumentUploadCardProps {
  title: string
  description: string
  status: DocumentStatus
  preview: string | null
  message: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  acceptedFormats: string
  helpText: string
}

function DocumentUploadCard({
  title,
  description,
  status,
  preview,
  message,
  onFileChange,
  onReset,
  acceptedFormats,
  helpText,
}: DocumentUploadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" ? (
          <div className="flex flex-col items-center py-8">
            <label htmlFor="document-upload" className="cursor-pointer">
              <div className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-muted-foreground/50 transition-colors">
                <FileUp className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
              </div>
              <input
                id="document-upload"
                type="file"
                className="hidden"
                accept={acceptedFormats}
                onChange={onFileChange}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-4 max-w-md text-center">{helpText}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="mb-6">
              {preview && (
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Document preview"
                  className="max-h-64 max-w-full object-contain rounded-lg border"
                />
              )}
            </div>

            <div
              className={`text-center mb-6 ${
                status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {status === "success" && <Check className="h-6 w-6 inline-block mr-2" />}
              {status === "error" && <AlertCircle className="h-6 w-6 inline-block mr-2" />}
              <p>{message}</p>
            </div>

            {status === "success" || status === "error" ? (
              <Button variant="outline" onClick={onReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Upload Different Document
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span>{status === "uploading" ? "Uploading..." : status === "processing" ? "Processing..." : ""}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

