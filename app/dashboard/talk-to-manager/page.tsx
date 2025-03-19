"use client";

import { BranchManagerAvatar } from "@/components/branch-manager/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Camera, CameraOff, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function TalkToManagerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your virtual branch manager. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 2000);
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const toggleCamera = () => {
    if (cameraActive && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
      setCapturedImage(null);
    } else {
      startCamera();
    }
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("loan") || input.includes("borrow")) {
      return "We offer various loan options including personal loans, home loans, and business loans. Would you like to check your eligibility for a specific loan type?";
    } else if (input.includes("document") || input.includes("kyc")) {
      return "You can register your documents in the Document Registration section. We'll need your identity proof (Aadhaar/PAN) and income proof for loan applications.";
    } else if (input.includes("interest") || input.includes("rate")) {
      return "Our current interest rates range from 7.5% to 12.5% depending on the loan type and your credit profile. Would you like me to check the specific rate for you?";
    } else if (input.includes("hello") || input.includes("hi")) {
      return "Hello! How can I assist you with your banking needs today?";
    } else {
      return "Thank you for your query. I can help you with loan applications, document verification, and general banking information. Could you please provide more details about what you're looking for?";
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Avatar>
                      <AvatarImage src="/bm.png" />
                      <AvatarFallback>BM</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarImage src="https://github.com/akarshghildyal.png" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar>
                    <AvatarImage src="/bm.png" />
                    <AvatarFallback>BM</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={input.trim() === ""}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-1/2 border-l px-4 py-6 hidden lg:block">
          <div className="h-full flex flex-col">
            <div className="text-center mb-4">
              <h3 className="font-semibold">Branch Manager</h3>
              <p className="text-sm text-muted-foreground">Ashok Kumar</p>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden assistant">
              <BranchManagerAvatar />
            </div>

            <Card className="mt-4 p-0">
              <CardContent className="space-y-4 p-0">
                <div className="relative overflow-hidden rounded-lg bg-muted aspect-video">
                  {!cameraActive && !capturedImage && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Camera is off. Click the camera icon to start.
                      </p>
                    </div>
                  )}
                  {capturedImage ? (
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured document"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={cn(
                        "w-full h-full object-cover",
                        cameraActive ? "" : "hidden"
                      )}
                    />
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleRecording}
                      className={cn("w-max px-4")}
                    >
                      {isRecording ? (
                        <span className="animate-pulse">Recording...</span>
                      ) : (
                        "Push to Talk"
                      )}
                      {isRecording ? (
                        <MicOff className="h-5 w-5 text-destructive" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleCamera}
                      className={cn("w-max px-4")}
                    >
                      {!cameraActive ? (
                        <CameraOff className="h-5 w-5 text-destructive" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
