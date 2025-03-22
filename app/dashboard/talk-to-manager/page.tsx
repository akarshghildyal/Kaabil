"use client";

import { BranchManagerAvatar } from "@/components/branch-manager/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Camera,
  CameraOff,
  Calendar,
  FileUp,
  Home,
  IdCard,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  User,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioBlob?: Blob; // Store the actual blob instead of URL
  isAudio?: boolean;
  documentData?: AadhaarData | PANData;
  documentType?: "aadhar" | "pan";
};

type DocumentType = "aadhar" | "pan";

interface AadhaarData {
  aadhaar_number: string | null;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  issue_date: string | null;
}

interface PANData {
  pan_number: string | null;
  full_name: string | null;
  father_name: string | null;
  date_of_birth: string | null;
  issue_date: string | null;
}

export default function TalkToManagerPage() {
  const approved = useSearchParams().has("approved");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: !approved
        ? "Hello! I'm your virtual branch manager. How can I assist you today?"
        : `You are now approved for a loan. Check your status in the dashboard.`,
      timestamp: new Date(),
    },
  ]);
  const [audioString, setAudioString] = useState<string | undefined>(undefined);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const router = useRouter();
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("aadhar");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAudioUrl = (blob: Blob): string => {
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "l") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "You are now approved for a loan based on our understanding. Taking you to the next step.",
            timestamp: new Date(),
          },
        ]);

        setTimeout(() => {
          router.push("/dashboard/apply-loan");
        }, 5000);
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getAIResponse = async (audio: Blob) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Failed to process your request. Please try again.",
      timestamp: new Date(),
    };

    const data = new FormData();
    data.set("user_id", "0");
    data.set("audio_file", audio);

    await fetch("http://172.20.10.3:8000/query/audio", {
      method: "POST",
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res;
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        const userMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "user",
          content: data.transcription,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        assistantMessage.content = data.response;
        setAudioString(`http://172.20.10.3:8000/audio/${data.audio_url}`);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    setIsProcessing(false);
    setMessages((prev) => [...prev, assistantMessage]);
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
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (audioRef.current) {
      audioRef.current.onplay = () => {
        interval = setInterval(() => {
          setMouthOpen((prev) => !prev);
        }, 240);
      };

      audioRef.current.onpause = () => {
        clearInterval(interval);
        setMouthOpen(false);
      };

      audioRef.current.onended = () => {
        clearInterval(interval);
        setMouthOpen(false);
        setIsPlayingAudio(null);
        setAudioString(undefined);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onended = null;
      }
      clearInterval(interval);
    };
  }, [audioRef.current]);

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

  const startRecording = async () => {
    const audioChunks: Blob[] = [];

    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(media);
      const recorder = new MediaRecorder(media, {
        mimeType: "audio/webm",
      });
      setAudioRecorder(recorder);

      setAudioChunks([]);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        // Store the blob directly, not the URL
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: "Audio message",
          audioBlob: audioBlob, // Store the blob itself
          isAudio: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsProcessing(true);
        await getAIResponse(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlayAudio = (messageId: string, audioBlob: Blob) => {
    if (isPlayingAudio === messageId) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(null);
      // Revoke the URL when done to prevent memory leaks
      if (audioString) {
        URL.revokeObjectURL(audioString);
        setAudioString(undefined);
      }
    } else {
      // Play new audio - create a blob URL only when needed
      if (audioRef.current) {
        // Revoke previous URL if exists
        if (audioString) {
          URL.revokeObjectURL(audioString);
        }
        // Create a new URL from the blob
        const audioUrl = getAudioUrl(audioBlob);
        setAudioString(audioUrl);
        setIsPlayingAudio(messageId);

        audioRef.current.onended = () => {
          setIsPlayingAudio(null);
          // Revoke URL after playing
          URL.revokeObjectURL(audioUrl);
        };
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    // Create a message showing the upload
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploading ${documentType === "aadhar" ? "Aadhaar" : "PAN"} card for verification...`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(selectedFile);

      const response = await fetch("http://localhost:8000/extract/document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: documentType,
          image: base64,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract document info");
      }

      const data = await response.json();

      // Add response to messages
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Here are the details extracted from your ${documentType === "aadhar" ? "Aadhaar" : "PAN"} card:`,
        timestamp: new Date(),
        documentData: data.data,
        documentType: documentType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error uploading document:", error);

      // Add error message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your document. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => reject(error);
    });
  };

  const renderAadhaarCard = (data: AadhaarData) => {
    return (
      <Card className="w-full overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800">Aadhaar Card</h3>
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Verified</div>
          </div>

          <div className="grid gap-3">
            {data.aadhaar_number && (
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Aadhaar Number</p>
                  <p className="font-medium">{data.aadhaar_number}</p>
                </div>
              </div>
            )}

            {data.full_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{data.full_name}</p>
                </div>
              </div>
            )}

            {data.gender && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium">{data.gender}</p>
                </div>
              </div>
            )}

            {data.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{data.date_of_birth}</p>
                </div>
              </div>
            )}

            {data.address && (
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium">{data.address}</p>
                </div>
              </div>
            )}

            {data.issue_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="font-medium">{data.issue_date}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPANCard = (data: PANData) => {
    return (
      <Card className="w-full overflow-hidden border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-yellow-800">PAN Card</h3>
            <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">Verified</div>
          </div>

          <div className="grid gap-3">
            {data.pan_number && (
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">PAN Number</p>
                  <p className="font-medium">{data.pan_number}</p>
                </div>
              </div>
            )}

            {data.full_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{data.full_name}</p>
                </div>
              </div>
            )}

            {data.father_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Father's Name</p>
                  <p className="font-medium">{data.father_name}</p>
                </div>
              </div>
            )}

            {data.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{data.date_of_birth}</p>
                </div>
              </div>
            )}

            {data.issue_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="font-medium">{data.issue_date}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                    {message.isAudio && message.audioBlob ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            // togglePlayAudio(message.id, message.audioBlob!);
                          }}
                        >
                          {isPlayingAudio === message.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="h-10 flex items-center">
                          <div className="w-32 bg-primary-foreground/20 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-primary-foreground/60 ${
                                isPlayingAudio === message.id
                                  ? "animate-progress"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-line">{message.content}</div>

                        {message.documentData && message.documentType && (
                          <div className="mt-3">
                            {message.documentType === 'aadhar'
                              ? renderAadhaarCard(message.documentData as AadhaarData)
                              : renderPANCard(message.documentData as PANData)
                            }
                          </div>
                        )}
                      </>
                    )}
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
            {isUploading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar>
                    <AvatarImage src="/bm.png" />
                    <AvatarFallback>BM</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing document...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            {selectedFile ? (
              <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mb-2">
                <Tabs
                  value={documentType}
                  onValueChange={(v) => setDocumentType(v as DocumentType)}
                  className="mb-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="aadhar">Aadhaar Card</TabsTrigger>
                    <TabsTrigger value="pan">PAN Card</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload {documentType === "aadhar" ? "Aadhaar" : "PAN"} Card
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (selectedFile) {
                      handleFileUpload();
                    } else {
                      handleSendMessage();
                    }
                  }
                }}
              />
              <Button
                onClick={selectedFile ? handleFileUpload : handleSendMessage}
                disabled={(selectedFile ? false : input.trim() === "") || isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
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
              <BranchManagerAvatar mouthOpen={mouthOpen} />
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
                      className={cn(
                        "w-max px-4",
                        isRecording
                          ? "bg-red-100 hover:bg-red-200 border-red-200"
                          : ""
                      )}
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
      <audio ref={audioRef} className="hidden" src={audioString} autoPlay />
      <style jsx global>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 15s linear forwards;
        }
      `}</style>
    </div>
  );
}
