// components/common/SubscriptionButton.tsx

"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SubscriptionButton({ className }: { className?: string }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/auth/subscription");
  };
  
  return (
    <Button 
      onClick={handleClick} 
      className={className}
      variant="outline"
    >
      Manage Subscription
    </Button>
  );
}