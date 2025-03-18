"use client";
import { Moon, Sun, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";

interface NavbarProps {
  bankName?: string;
}

export function Navbar({ bankName = "Bank of Friends" }: NavbarProps) {
  const { isDarkMode, toggleDarkMode, adjustScale, adjustFontSize } =
    useAppContext();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-sm py-3 px-4 z-10 flex items-center">
      {/* App name on the left */}
      <div className="text-black text-xl font-semibold font-mono tracking-wider dark:text-white">
        Saksham
      </div>

      {/* Bank name centered with more space */}
      <div className="flex-1 text-center text-lg font-medium text-gray-700 dark:text-gray-200">
        {bankName}
      </div>

      {/* Size controls and dark mode toggle on the right */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-md overflow-hidden dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustScale(0.1)}
            className="h-8 px-2 dark:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustScale(-0.1)}
            className="h-8 px-2 dark:text-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center border rounded-md overflow-hidden dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustFontSize(0.1)}
            className="h-8 px-2 text-xs font-bold dark:text-white"
          >
            A+
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustFontSize(-0.1)}
            className="h-8 px-2 text-xs font-bold dark:text-white"
          >
            A-
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="mr-2 dark:text-white"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </nav>
  );
}
