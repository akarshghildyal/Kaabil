"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      // Redirect to login page if not logged in
      router.push("/auth/login");
    }
  }, [router]);

  // If we're on the client side and the user isn't logged in,
  // don't render the children while we're redirecting
  if (typeof window !== "undefined" && !isUserLoggedIn()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}