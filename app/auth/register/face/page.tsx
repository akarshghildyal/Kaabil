"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Building2, Camera, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function FaceRegistrationPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const faceVerified = localStorage.getItem("faceVerified");

    // If user is fully authenticated, redirect to dashboard
    if (userId && userName && faceVerified === "true") {
      router.push("/dashboard");
      return;
    }

    // If user is not partially authenticated (no userId/userName), redirect to register
    if (!userId || !userName) {
      router.push("/auth/register");
      return;
    }

    setIsCheckingAuth(false);
    startCamera();
  }, [router]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    startCamera();
  };

  const completeRegistration = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast("User ID not found. Please register first.");
      setLoading(false);
      return;
    }

    if (!capturedImage) {
      toast("No image captured. Please capture your face.");
      setLoading(false);
      return;
    }

    const body = {
      name: userId,
      image: capturedImage.split(",")[1],
    };

    const res = await fetch("http://0.0.0.0:8000/register/face", {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Face registration failed. Please try again.");
      setLoading(false);
      return;
    }

    if (data.error) {
      toast.error(data.error);
      setLoading(false);
      return;
    }

    // Set face verification flag
    localStorage.setItem("faceVerified", "true");

    setLoading(false);
    setRegistrationComplete(true);
    toast.success("Face registered successfully!");
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/auth/register"
        className="absolute top-8 left-8 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Registration
      </Link>

      <div className="flex items-center mb-8">
        <Building2 className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-bold">VirtualBank</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Face Registration</CardTitle>
          <CardDescription>
            Register your face for secure login and verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrationComplete ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Registration Complete!
              </h3>
              <p className="text-center text-muted-foreground">
                Your face has been successfully registered. Redirecting to
                login...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-lg bg-muted aspect-video flex items-center justify-center">
                {capturedImage ? (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center gap-4">
                {capturedImage ? (
                  <>
                    <Button variant="outline" onClick={resetCapture}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    <Button onClick={completeRegistration} disabled={loading}>
                      {loading ? "Processing..." : "Confirm & Continue"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={captureImage}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Image
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Please ensure:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your face is clearly visible</li>
                  <li>Good lighting conditions</li>
                  <li>No sunglasses or face coverings</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!registrationComplete && !capturedImage && (
            <p className="text-sm text-muted-foreground">
              Your face data will be securely stored and used only for
              authentication purposes.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
