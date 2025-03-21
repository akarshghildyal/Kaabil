"use client";

import type React from "react";

import { FaceLoginComponent } from "@/components/auth/face-login";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Building2, KeyRound, Scan } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (loginMethod === "password") {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to login");
        }

        // Store user data in localStorage
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);

        toast({
          title: "Login successful",
          description: "Welcome back to VirtualBank",
        });

        // After successful login with password, switch to face verification
        setLoginMethod("face");

      } catch (err: any) {
        setError(err.message || "Something went wrong");
        toast({
          title: "Login failed",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Face login is handled by the FaceLoginComponent
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (loginMethod === "password") {
      return;
    }
    setLoginMethod(value);
  };

  const handleFaceLoginSuccess = () => {
    toast({
      title: "Face verification successful",
      description: "You are now logged in",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="flex items-center mb-8">
        <Building2 className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-bold">VirtualBank</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login to your account</CardTitle>
          <CardDescription>
            Choose your preferred login method below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <Tabs
            defaultValue="password"
            className="w-full"
            value={loginMethod}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">
                <KeyRound className="h-4 w-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="face">
                <Scan className="h-4 w-4 mr-2" />
                Face Recognition
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="face">
              <FaceLoginComponent onSuccess={handleFaceLoginSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
