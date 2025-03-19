"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Check } from "lucide-react"

interface FaceLoginComponentProps {
  onSuccess: () => void
}

export function FaceLoginComponent({ onSuccess }: FaceLoginComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle")

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      context?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageDataUrl = canvas.toDataURL("image/png")
      setCapturedImage(imageDataUrl)
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setVerificationStatus("idle")
  }

  const verifyFace = () => {
    setLoading(true)
    setVerificationStatus("verifying")

    // Simulate face verification process
    setTimeout(() => {
      setLoading(false)
      setVerificationStatus("success")

      // Call onSuccess after a short delay
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg bg-muted aspect-video flex items-center justify-center">
        {capturedImage ? (
          <img src={capturedImage || "/placeholder.svg"} alt="Captured face" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        {verificationStatus === "success" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-background rounded-full p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={resetCapture} disabled={loading || verificationStatus === "success"}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button onClick={verifyFace} disabled={loading || verificationStatus === "success"}>
              {loading ? "Verifying..." : "Verify Face"}
            </Button>
          </>
        ) : (
          <Button onClick={captureImage}>
            <Camera className="mr-2 h-4 w-4" />
            Capture Image
          </Button>
        )}
      </div>

      {verificationStatus === "success" && (
        <div className="text-center text-sm text-primary">Face verification successful! Redirecting...</div>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Please ensure your face is clearly visible and well-lit for accurate verification.</p>
      </div>
    </div>
  )
}

