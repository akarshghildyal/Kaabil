"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

export default function LoginPage() {
  const { scale, fontSize } = useAppContext();

  // State for camera
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "pending" | "initial"
  >("initial");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to start camera
  const startCamera = async () => {
    try {
      // First set to pending state while we request permission
      setCameraPermission("pending");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      // Store the stream reference
      streamRef.current = stream;

      // Only update video element if it exists
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Important: Wait for the video to be ready before updating UI state
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, camera ready");
          setCameraPermission("granted");
          setIsCapturing(true);
        };

        // Handle potential video errors
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          setCameraPermission("denied");
          setIsCapturing(false);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraPermission("denied");
      setIsCapturing(false);
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    console.log("Stopping camera");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
  };

  // Toggle camera
  const toggleCamera = () => {
    console.log("Toggle camera, current state:", isCapturing);
    if (isCapturing) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Add debugging log for state changes
  useEffect(() => {
    console.log("Camera state updated:", { isCapturing, cameraPermission });
  }, [isCapturing, cameraPermission]);

  return (
    <div className="min-h-screen bg-[#f8f7f2] dark:bg-gray-900 flex flex-col items-center justify-center p-4 pt-20">
      {/* Navbar */}
      <Navbar />

      {/* Main login container */}
      <Card
        className="w-full max-w-4xl overflow-hidden border-2 rounded-3xl dark:bg-gray-800 dark:border-gray-700"
        style={{ transform: `scale(${scale})` }}
      >
        <CardContent className="p-0">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Camera/Face login section */}
            <div className="md:col-span-3 p-6 flex flex-col">
              <div
                className="flex-1 bg-white dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden"
                style={{ fontSize: `${fontSize}rem` }}
              >
                {/* Always render the video element but control its visibility */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${
                    isCapturing && cameraPermission === "granted"
                      ? "block"
                      : "hidden"
                  }`}
                />

                {/* Show appropriate UI based on camera state */}
                {(!isCapturing || cameraPermission !== "granted") && (
                  <div className="text-center z-10">
                    {cameraPermission === "denied" ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
                        <p className="text-red-500 dark:text-red-400">
                          Camera permission denied
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                          Please enable camera access in your browser settings
                        </p>
                      </div>
                    ) : cameraPermission === "pending" ? (
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Requesting camera access...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Click &quot;Login with Face&quot; to start camera
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex">
                <div
                  className={`rounded-full py-2 px-4 flex items-center ${
                    isCapturing && cameraPermission === "granted"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full mr-2 ${
                      isCapturing && cameraPermission === "granted"
                        ? "bg-red-400 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span
                    style={{ fontSize: `${fontSize}em` }}
                    className="dark:text-gray-200"
                  >
                    {isCapturing && cameraPermission === "granted"
                      ? "Capturing"
                      : "Not Capturing"}
                  </span>
                </div>
                <Button
                  className={`ml-auto rounded-full ${
                    isCapturing
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  onClick={toggleCamera}
                  style={{ fontSize: `${fontSize}em` }}
                >
                  {isCapturing ? "Stop Camera" : "Login with Face"}
                </Button>
              </div>
            </div>

            {/* Credentials login section */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 flex flex-col">
              <div className="mb-4" style={{ fontSize: `${fontSize}em` }}>
                <label className="block text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-1 mb-2">
                  Customer ID
                </label>
                <Input
                  type="text"
                  className="w-full dark:bg-gray-700 dark:border-gray-600"
                  style={{ fontSize: `${fontSize}em` }}
                />
              </div>

              <div className="mb-6" style={{ fontSize: `${fontSize}em` }}>
                <label className="block text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-1 mb-2">
                  Password / Pin
                </label>
                <Input
                  type="password"
                  className="w-full dark:bg-gray-700 dark:border-gray-600"
                  style={{ fontSize: `${fontSize}em` }}
                />
              </div>

              <Button className="w-full" style={{ fontSize: `${fontSize}em` }}>
                Login
              </Button>

              <div className="mt-4 text-center">
                <Link
                  href="/emp/login"
                  className="text-sm italic text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  style={{ fontSize: `${fontSize}em` }}
                >
                  Employee Login
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
