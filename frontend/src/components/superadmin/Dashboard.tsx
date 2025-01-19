// @/components/superadmin/Dashboard.tsx

"use client";
import React from "react";
import { Sun, Moon, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex flex-1 h-full flex-col">
      {/* Navbar */}
      <div className="flex h-12 items-center justify-end bg-gray-100 dark:bg-neutral-800 px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
          <LanguageToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200">
                <User className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* dashboard content */}
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1">
          <div className="flex gap-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={`first-row-${index}`}
                className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
              ></div>
            ))}
          </div>
          <div className="flex gap-2 flex-1">
            {[...Array(2)].map((_, index) => (
              <div
                key={`second-row-${index}`}
                className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
