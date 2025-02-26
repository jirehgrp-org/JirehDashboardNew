// @/components/common/LoadingSpinner.tsx
"use client";

import React from "react";
import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 animate-spin">
          <Image 
            src="/images/logo.png" 
            alt="Loading" 
            fill 
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}