"use client";

import type React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Building2, Home, LogOut, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getCurrentUserName, logoutUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);

  // Load user name from localStorage on component mount
  useEffect(() => {
    const name = getCurrentUserName();
    setUserName(name);
  }, []);

  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    router.push("/auth/login");
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Talk to Manager",
      icon: MessageSquare,
      href: "/dashboard/talk-to-manager",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-3">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">VirtualBank</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu className="px-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <ThemeToggle />
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </div>
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{userName?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userName || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      Customer
                    </span>
                  </div>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
